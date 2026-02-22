---
layout: post
tags: llama3 langcahinrb
title: How to use langchainrb and llama3 to generate blog posts
date: 2024-04-22
---
```
LangchainrbRails.configure do |config|
  config.vectorsearch = Langchain::Vectorsearch::Pgvector.new(
    llm: Langchain::LLM::Ollama.new(
      url: 'http://localhost:11434',
      default_options: {
        completion_model_name: "llama3",
        embeddings_model_name: "llama3",
        chat_completion_model_name: "llama3"
      }
    )
  )
end
```

```
def ask(question:, k: 4, &block)
  ActiveRecord::Base.logger.silence do
    search_results = provider.similarity_search(query: @theme, k: k)

    context = search_results.map do |result|
      result.as_vector
    end
    context = context.join("\n---\n")

    prompt = provider.generate_rag_prompt(question: question, context: context)

    messages = [{role: "user", content: prompt}]
    provider.llm.chat(messages: messages, &block)
  end
end
```