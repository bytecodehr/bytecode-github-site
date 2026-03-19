---
layout: post
tags: llm fine-tuning rails lora
title: "Training Rails LLMs, part 1: from 45 repos to 111K training samples"
description: "How we built a 15-step dataset pipeline from 45 Rails repositories — 35 private client projects and 10 open-source codebases — to train three domain-specific language models that write code our way. The dataset engineering mattered more than the model."
date: 2025-03-10
---

General-purpose LLMs write generic Rails code. They suggest Devise for authentication, Pundit for authorization, service objects for business logic, and ActiveAdmin for dashboards. That is what the internet's most popular Rails tutorials teach, and that is what the training data reflects.

We do not build that way. Our Rails applications use custom authentication with Identity and MagicLink models, namespaced concerns instead of service objects, DaisyUI drawer layouts instead of ActiveAdmin, Solid Queue instead of Sidekiq, and state-as-records instead of boolean flags. We have been building this way across 35+ client projects and our own internal tools for years.

So we fine-tuned three models that think in our patterns natively. Not through prompting or RAG retrieval — through the actual model weights. This is Part 1: how we built the dataset. Part 2 covers training, quantization, and deployment.

## Why fine-tune at all

There are three ways to make an LLM know about your codebase:

**System prompts** are free and instant, but the model forgets instructions mid-conversation, context windows are limited, and you cannot encode deep architectural knowledge in a paragraph of instructions.

**RAG (Retrieval-Augmented Generation)** uses your real code as context, but retrieval is imperfect, the infrastructure is complex, inference is slower, and the model still does not understand your patterns — it just sees nearby code.

**Fine-tuning** bakes your knowledge into the model weights. The model does not look up your patterns; it thinks in them. The cost is $50-100 and a day of work building the dataset.

We went with fine-tuning.

## Three models, three jobs

We trained three separate models, each for a different use case:

**30B (Qwen3-Coder-30B-A3B)** — the big brain. A Mixture-of-Experts model with 30 billion total parameters but only 3.3 billion active per token. 256K context window. Designed for architecture decisions, complex debugging, and code review. Runs on a Mac with 32 GB RAM.

**8B (Qwen3-8B)** — the workhorse. A dense transformer with strong reasoning capabilities. Fits in a 16 GB Docker container. Good for error analysis, code review, and general chat about Rails patterns.

**3B (Qwen2.5-Coder-3B)** — the fast coder. Code-specialized from pretraining with native Fill-in-the-Middle (FIM) tokens, which is how tab-completion works in editors. When your editor sends the code before and after the cursor, this model fills in the middle. Runs anywhere. 2 GB.

The 3B model is specifically Qwen2.5-Coder and not Qwen3 because FIM tokens must be baked into the tokenizer during pretraining. You cannot add them after the fact.

## The 15-step dataset pipeline

The dataset is where 80% of the value is created. We built 15 Ruby scripts that run sequentially, each one producing or refining training data. The input: 45 Rails repositories (35 private, 10 open-source including Mastodon, Discourse, and GitLab). The output: 111,322 training samples in ChatML format.

### Steps 1-2: Extract and pair

Walk every `.rb`, `.erb`, and `.yml` file in all 45 repos. For each file, generate instruction/response pairs:

- "Explain this code" paired with an explanation
- "Write a model/controller/view that does X" paired with the actual code
- File path and surrounding context used to create prompts that match how developers actually ask questions

### Step 3: Git diff pairs

For each repo, extract meaningful commits and pair the before/after states of changed files:

```ruby
# For each repo, extract commits that modified Ruby files
git log --diff-filter=M --name-only
# For each changed file:
git show COMMIT:path/to/file    # after
git show COMMIT~1:path/to/file  # before
```

This creates "here is a bug / here is the fix" pairs from real commit history. The model learns what actual refactoring and bug-fixing looks like in practice.

### Steps 4-5: Code reviews and test pairs

`generate_review_data.rb` creates code review samples: "Review this code" paired with a list of concrete issues. `generate_rspec_pairs.rb` pairs implementation files with their corresponding specs, teaching the model how we write tests.

### Steps 6-8: Advanced samples

Cross-file refactoring: "Given these 3 files, extract the shared logic into a concern." Bug-fix pairs with explanations of what was wrong and why. Synthetic Q&A covering 50 Rails topics with detailed answers reflecting our opinions.

### Step 9: Architecture patterns

This is the step that makes the models different from a generic coding assistant. We extract real code from our reference applications and generate instruction/response pairs that teach our specific architectural decisions:

```ruby
# generate_architecture_data.rb extracts patterns from:
# - Fizzy: concern-per-behavior, state-as-records, CRUD-only controllers
# - Bugclaw: DaisyUI admin, drawer layout, Tabler Icons
# - Rails-Forge: UUID patterns, mass migration

# Creates pairs like:
# "Implement path-based multi-tenancy using SCRIPT_NAME"
# → Full implementation with middleware, Current attributes, and routing
```

### Step 10: FIM data

For every Ruby file in all 45 repos, pick a random line, split the file into prefix (everything before) and suffix (everything after), and use the line content as the expected completion:

```ruby
# For a file with 100 lines, pick line 42:
prefix = lines[0..41].join("\n")   # everything before cursor
suffix = lines[43..99].join("\n")  # everything after cursor
middle = lines[42]                  # what the model should generate
```

We also generate repo-level FIM where the prefix includes imports and class definitions from other files in the same project.

### Steps 11-12: Clean and balance

This is the most important quality step. We started with 178,000 samples and removed 67,000 of them:

- Boilerplate samples ("Here is a simple explanation...")
- Duplicate code blocks
- Samples longer than 8K tokens (waste of training compute)
- Capped any single repo at 20% of the total (GitLab was 48% before capping)

### Steps 13-15: Opinionated data

This is what makes the models opinionated rather than generic.

**Contrastive pairs** teach the model not just what to do, but what not to do:

```json
{
  "messages": [
    {"role": "user", "content": "How should I manage card state in Rails?"},
    {"role": "assistant", "content": "Do not use boolean flags like closed: true.\n\nUse state-as-records instead:\n\nclass Card::Closure < ApplicationRecord\n  belongs_to :card\n  belongs_to :closer, class_name: 'User'\nend\n\nBoolean flags lose context — who closed it, when, why. State records preserve history and enable querying."}
  ]
}
```

**DaisyUI admin pairs** use real code from our applications to teach admin UI patterns with drawer layouts, Tabler Icons, and component structure.

**Expanded Q&A** covers Rails 8, Hotwire, and Solid Queue — the stack we actually deploy on.

## Dataset statistics

| Metric | Value |
|---|---|
| Total samples | 111,322 |
| Train split | 100,189 (90%) |
| Validation split | 5,566 (5%) |
| Test split | 5,567 (5%) |
| Chat samples | 89.8% |
| FIM samples | 10.2% |
| Average tokens per sample | ~800 |
| Contrastive pairs | 29 |
| Architecture samples | 239 |
| DaisyUI admin pairs | 17 |

## What we learned about data quality

Round 1 had 2,790 samples and produced decent results. Round 2 started with 178K samples, which sounds like an improvement, but raw quantity made things worse until we removed the 67K garbage samples.

Signs of bad data: loss drops to zero quickly (the model memorized junk), the model outputs boilerplate markdown headers for every response, answers are vague and generic.

Signs of good data: loss converges smoothly to the 0.4-0.6 range, the model gives specific opinionated answers, generated code matches your patterns.

The 111K remaining samples are higher quality than the original 178K. Dataset engineering is not about volume — it is about signal density.

## What the models learned

After fine-tuning, when you ask the 30B model "How should I add authentication to a Rails app?", it does not suggest Devise. It walks through building Identity, Session, and MagicLink models with `has_secure_password`, Current attributes, and a sessions controller. That pattern came from our architecture samples.

When you ask it to build an admin dashboard, it reaches for DaisyUI drawer layout with Tabler Icons — not ActiveAdmin or Administrate. When it needs background jobs, it uses Solid Queue, not Sidekiq.

That is what fine-tuning buys you. Not a model that is generically better at coding — a model that codes like your team.

Part 2 covers the training process, GGUF quantization, the disk-space battle during export, and deploying the models locally with Ollama.
