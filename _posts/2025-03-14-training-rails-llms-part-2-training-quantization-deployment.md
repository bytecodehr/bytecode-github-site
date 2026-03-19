---
layout: post
tags: llm fine-tuning rails lora gguf ollama
title: "Training Rails LLMs, part 2: LoRA training, GGUF quantization, and local deployment"
description: "The second half of our fine-tuning project — training three models on a single A100 GPU for $75, fighting disk quotas during export, quantizing 30 billion parameters into a 17 GB file, and deploying everything locally with Ollama."
date: 2025-03-14
---

[Part 1](/2025/03/10/training-rails-llms-part-1-dataset-engineering/) covered building the dataset: 111K training samples from 45 Rails repos. This is Part 2: how we actually trained the models, got them out of the cloud, and deployed them on a laptop.

## LoRA: training 0.78% of the parameters

A 30 billion parameter model has roughly 60 GB of float16 weights. Full fine-tuning means loading all of those into GPU memory, computing gradients for every parameter (another 60 GB), and storing optimizer states (another 120 GB for Adam). Total: around 240 GB of VRAM. That requires four A100 80 GB GPUs and costs thousands of dollars per run.

LoRA (Low-Rank Adaptation) makes this feasible on a single GPU. Instead of updating a full weight matrix W (4096 x 4096 = 16.7 million parameters), LoRA decomposes the update into two small matrices:

```
Original:  W                  (4096 x 4096 = 16,777,216 params)
LoRA:      W + B x A          where A is (r x 4096) and B is (4096 x r)

With r = 16:
  A: 16 x 4096 =    65,536 params
  B: 4096 x 16 =    65,536 params
  Total:             131,072 params  (0.78% of original)
```

The base model stays frozen. Only the tiny LoRA matrices get trained. The training process runs a forward pass through the frozen base, a forward pass through the LoRA adapters, combines the outputs, computes loss, and backpropagates through only the LoRA weights.

VRAM needed for our 30B model: base model loaded in 4-bit quantization (about 8 GB) plus LoRA weights (about 200 MB) plus gradients and optimizer states. Total: 30-40 GB. Fits on a single A100 80 GB.

## The training configuration

We used [Unsloth](https://github.com/unslothai/unsloth) for training — it provides 2x faster LoRA training through custom CUDA kernels, optimized memory management, and built-in GGUF export. The alternative is HuggingFace TRL directly, which works but is slower.

The core training script:

```python
from unsloth import FastLanguageModel
from trl import SFTTrainer, SFTConfig

# Load base model with LoRA
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/qwen3-coder-30b-a3b-instruct",
    max_seq_length=8192,
    load_in_4bit=True,   # QLoRA — base in 4-bit, LoRA in float16
)

# Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,               # LoRA rank
    lora_alpha=32,       # scaling factor (2x rank)
    lora_dropout=0.0,    # must be 0 for Qwen3
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
)

# Training config
training_args = SFTConfig(
    num_train_epochs=1,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,  # effective batch size: 16
    learning_rate=2e-5,
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    bf16=True,
    packing=True,       # pack multiple samples per sequence
    max_seq_length=8192,
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    tokenizer=tokenizer,
)
trainer.train()
```

### Key hyperparameters

**Batch size and gradient accumulation.** We process 2 samples per GPU step and accumulate gradients over 8 micro-batches before updating weights. Effective batch size: 16. Larger batches produce smoother training but take longer.

**Learning rate (2e-5).** Too high and the model forgets its base knowledge (catastrophic forgetting). Too low and the model barely changes. 2e-5 is standard for LoRA fine-tuning.

**Cosine scheduler with 3% warmup.** The learning rate starts at zero, ramps up to 2e-5 over the first 3% of training steps, then follows a cosine curve back down. The model learns aggressively early, then fine-tunes gently.

**Packing.** Without packing, short samples are padded with zeros — wasting 60% of each sequence. With packing, multiple samples are concatenated into a single sequence. This speeds up training significantly for datasets with variable-length samples.

**Qwen3 requires lora_dropout=0.0.** This is not a tuning choice. PEFT's ParamWrapper implementation for Qwen3 is incompatible with dropout. The training crashes if you set it to anything else.

### Training per model

| Model | LoRA rank | Epochs | Steps | Time | Loss (final) | Cost |
|---|---|---|---|---|---|---|
| 30B MoE | r=16 | 1 | 6,262 | ~26h | 0.45-0.55 | ~$32 |
| 8B Dense | r=16 | 2 | 12,524 | ~17h | ~0.50 | ~$21 |
| 3B Dense | r=32 | 3 | 18,786 | ~14h | ~0.48 | ~$17 |

All trained on a single RunPod A100 SXM4 80 GB at $1.22/hour. Total training cost: about $70. The 3B model gets a higher rank (r=32) and more epochs because smaller models need more capacity in their adapters to learn the same patterns.

### Monitoring loss

Loss is the primary metric during training. For our 30B model, it started around 1.57 (the model is essentially random on our specific data) and settled at 0.45-0.55 after one epoch. That range means good convergence. Below 0.3 means overfitting — the model memorized the training data instead of learning generalizable patterns. Above 1.0 after many steps means the model is not learning — check data quality.

## GGUF quantization

After training, the LoRA adapters are separate files (about 10 GB for the 30B). To use the model, you merge the adapters back into the base model weights:

```
W_final = W_base + (alpha / r) x B x A
```

This produces a complete model at float16 — 60 GB for the 30B. Nobody wants to distribute or run a 60 GB file. Quantization compresses the weights to lower precision.

A 16-bit float stores each weight with high precision: 1.234375. A 4-bit integer stores it as approximately 1.2. The model loses some nuance but keeps most of its knowledge. A 30B model at float16 is 60 GB. At 4-bit (Q4_K_M), it is 17 GB. Same knowledge, 3.5x smaller.

The K-quant formats in llama.cpp use mixed precision — more important layers (attention outputs, embeddings, output head) get 6-bit precision while robust layers (MLP projections) get 4-bit. The "_M" in Q4_K_M means Medium quality, balancing size and accuracy.

### Our quantization formats

| Format | 30B Size | Bits per weight | Quality |
|---|---|---|---|
| F16 (original) | 60 GB | 16.0 | Reference |
| Q8_0 | 31 GB | 8.0 | Near-lossless |
| Q5_K_M | 21 GB | 5.69 | Excellent — fits 32 GB Mac |
| Q4_K_M | 18 GB | 4.86 | Good — smaller RAM fallback |

One advantage of MoE models: about 80% of parameters are in expert layers, and only 2 of 64 experts activate per token. The routing gate (which expert to use) stays at higher precision. Individual expert quality matters less when you have 64 of them. MoE models quantize better than dense models of similar total size.

## The export battle

Training was straightforward. Export took 6 attempts over 18 hours.

The problem: RunPod has a hidden disk quota of roughly 95 GB per pod. `df -h` shows 123 TB free (the network volume), but the actual usable space is capped. Merging the 30B model needs the HuggingFace cache (57 GB of base model shards) plus the merged output (57 GB of the same shards with LoRA weights folded in). Total: 114 GB. Exceeds the 95 GB quota.

Attempts 1-3 used standard Unsloth export and crashed on disk quota. Attempt 4 tried copying shards and deleting cache incrementally — but the copy fails before the delete happens. Attempt 5 got the Q8_0 intermediate working but llama.cpp refused to re-quantize without a flag we did not know about.

Attempt 6 solved it with `os.rename`:

```python
import os, shutil

_orig_copyfile = shutil.copyfile

def _patched_copyfile(src, dst, *args, **kwargs):
    real_src = os.path.realpath(src)  # resolve HF cache symlinks
    if (real_src.endswith('.safetensors')
        and os.path.getsize(real_src) > 100_000_000
        and os.stat(real_src).st_dev == os.stat(os.path.dirname(dst)).st_dev):
        try:
            os.rename(real_src, dst)
            return dst
        except OSError:
            pass
    return _orig_copyfile(src, dst, *args, **kwargs)

shutil.copyfile = _patched_copyfile
```

When source and destination are on the same filesystem, `os.rename()` is atomic — it just updates the filesystem pointer. Zero additional disk space. The 3.8 GB shards teleport from the cache directory to the output directory instantly.

### The full export pipeline

```
Phase 1: Load model with LoRA merged in memory
Phase 2: Save merged F16 safetensors (os.rename moves cache shards)
         Result: 57 GB of merged shards, cache is empty
Phase 3: Convert safetensors to Q8_0 GGUF (31 GB)
         Delete F16 safetensors (57 GB freed)
Phase 4: Quantize Q8_0 to Q4_K_M (17 GB)
         Upload to HuggingFace, delete local copy
Phase 5: Quantize Q8_0 to Q5_K_M (21 GB)
         Upload to HuggingFace, delete local copy
Phase 6: Delete Q8_0 (31 GB freed)
```

Peak disk usage: 88 GB (after Q8_0 conversion, before deleting F16). Under the 95 GB quota.

### MoE adapter loading

Standard LoRA loading fails for MoE models with a size mismatch on expert layers. The correct approach with Unsloth is to pass the adapter directory as the model name — Unsloth reads `adapter_config.json`, downloads the correct base model, applies MoE-specific patches, and merges the LoRA weights automatically.

```python
# Wrong — causes RuntimeError on MoE expert layers
model = AutoModelForCausalLM.from_pretrained("base-model")
model.load_adapter("adapters/")

# Correct — Unsloth handles MoE patching internally
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="adapters/",  # adapter dir, not base model
    load_in_4bit=True,
)
```

## Deployment with Ollama

The final GGUF files go into Ollama, which runs a local HTTP API:

```dockerfile
# Modelfile-30b
FROM ./qwen3-coder-30b-rails-Q5_K_M.gguf

SYSTEM """You are an expert Ruby on Rails architect. You prefer concerns
over service objects, CRUD-only controllers, state-as-records, Solid Queue
over Sidekiq, custom auth over Devise, DaisyUI admin over ActiveAdmin."""

PARAMETER temperature 0.4
PARAMETER top_p 0.8
PARAMETER num_ctx 32768
```

```bash
ollama create rails-coder-30b -f Modelfile-30b
ollama run rails-coder-30b "Refactor this controller to use concerns"
```

### IDE integration

For VS Code and JetBrains via Continue:

```json
{
  "models": [{
    "title": "Rails 30B",
    "provider": "ollama",
    "model": "rails-coder-30b"
  }],
  "tabAutocompleteModel": {
    "title": "Rails 3B FIM",
    "provider": "ollama",
    "model": "rails-coder-3b"
  }
}
```

The 30B model handles chat and code review. The 3B model handles tab-completion. Both run locally, completely offline.

### Memory requirements

| Model | GGUF size | Min RAM | Recommended |
|---|---|---|---|
| 30B Q5_K_M | 21 GB | 24 GB | 32 GB |
| 30B Q4_K_M | 18 GB | 20 GB | 24 GB |
| 8B Q4_K_M | 4.7 GB | 8 GB | 16 GB |
| 3B Q4_K_M | 2 GB | 4 GB | 8 GB |

Rule of thumb: GGUF file size plus 2-4 GB for KV cache and overhead.

## Total cost

| Item | GPU | Hours | Cost |
|---|---|---|---|
| 30B training | A100 80 GB | ~26h | ~$32 |
| 8B training | A100 80 GB | ~17h | ~$21 |
| 3B training | A100 80 GB | ~14h | ~$17 |
| Export (all models) | A100 80 GB | ~4h | ~$5 |
| **Total** | | **~61h** | **~$75** |

The 8B and 3B could have trained on an A40 at $0.20/hour, which would have cut the total to about $42. We used the A100 for all three to avoid setup overhead.

## What we would do differently

**Start with the smallest model.** Train the 3B first, evaluate it, fix dataset issues, then scale up. We trained the 30B first and discovered data problems that required reprocessing.

**Budget 2x time for export.** The training itself is predictable. Export is where the surprises are — disk quotas, format conversion quirks, requantization flags.

**Invest more in contrastive pairs.** The 29 contrastive pairs (wrong way vs right way) had outsized impact on model behavior compared to the thousands of generic code samples. More of these would make the models even more opinionated.

**Cap data sources earlier.** GitLab at 48% of the dataset meant the model was essentially a GitLab specialist. The 20% cap per source should have been applied from the start.

## Models

All three models are on HuggingFace:

- `bytecodehr/qwen3-coder-30b-rails` (Q4_K_M and Q5_K_M)
- `bytecodehr/qwen3-8b-rails` (Q4_K_M)
- `bytecodehr/qwen2.5-coder-3b-rails` (Q4_K_M)

The adapters are published alongside the quantized models, so you can merge them with the base models yourself if you want a different quantization format.
