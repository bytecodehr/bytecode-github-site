---
layout: post
tags: [ruby]
title: "What's New in Ruby 4.0: ZJIT, Ruby Box, and What It Means for Your Apps"
description: Ruby 4.0 shipped in December 2025 with two headline features — the ZJIT compiler and Ruby Box. Here's what actually changed, what's worth paying attention to, and whether you should upgrade.
date: 2026-01-20 10:00:00 +0200
---

Ruby 4.0 dropped on Christmas Day 2025. Matz and the core team have been teasing this release for a while, and the two headline features — ZJIT and Ruby Box — are genuinely significant. Not in a "rewrite your app" way, but in a "the language is getting meaningfully faster and safer" way.

We've been running 4.0 in a couple of staging environments since January and upgraded one production app. Here's what we've noticed and what we think matters.

## ZJIT: the new just-in-time compiler

YJIT was the big performance story in Ruby 3.x. Developed at Shopify, it gave real-world Rails apps a 15-30% speedup with basically zero effort. ZJIT is its successor — or more accurately, its complement.

ZJIT takes a different approach to compilation. Where YJIT compiles method-by-method based on runtime profiling, ZJIT is more aggressive about optimizing across method boundaries. The practical result is better performance on code that YJIT couldn't optimize well — things like deeply nested method calls, heavy metaprogramming, and certain patterns in template rendering.

You enable it the same way:

```bash
ruby --zjit your_script.rb

# or in your environment
RUBY_ZJIT_ENABLE=1
```

The Ruby team has been careful to say that ZJIT and YJIT serve different use cases and you shouldn't assume one is always better. In our testing, ZJIT showed the most improvement on computation-heavy background jobs. For typical Rails request/response cycles, the difference compared to YJIT was modest — maybe 5-10% on top of what YJIT already gave us.

Worth enabling? Absolutely, if you're already on Ruby 4.0. But it's not a reason by itself to rush an upgrade from 3.4.

## Ruby Box: sandboxed execution

This one is more interesting to us long-term. Ruby Box (officially `Ruby::Box`) is a sandboxing mechanism that lets you run Ruby code with restricted capabilities. Think of it as a way to execute untrusted or semi-trusted code without giving it access to the filesystem, network, or system commands.

```ruby
box = Ruby::Box.new(
  allow_network: false,
  allow_filesystem: :read_only,
  memory_limit: 50_mb,
  timeout: 5.seconds
)

result = box.eval("2 + 2")
# => 4

box.eval("File.delete('/etc/passwd')")
# => Ruby::Box::PermissionError
```

The API is still evolving, but the core idea is solid. If you're building anything that evaluates user-provided code — a coding education platform, a plugin system, a rule engine — this is a big deal. Previously you needed Docker containers or separate processes to get any kind of isolation.

We haven't used it in production yet, but we've been prototyping with it for a client who needs a configurable data transformation layer. Being able to let users write Ruby snippets without worrying about them `rm -rf`-ing the server is genuinely useful.

## The smaller changes that matter

The headline features get the attention, but some of the quieter changes affect day-to-day coding more:

**Pattern matching is no longer experimental.** It was technically stable in 3.2, but the "experimental" label kept people from using it. In 4.0 it's a first-class feature. We've started using it for parsing API responses and it reads much better than nested `if/elsif` chains:

```ruby
case api_response
in { status: 200, body: { data: Array => items } }
  process_items(items)
in { status: 404 }
  handle_not_found
in { status: (500..) }
  handle_server_error
end
```

**Improved error messages continue to get better.** Ruby has been on a tear with helpful error output since 3.1, and 4.0 continues the trend. Typo suggestions, clearer stack traces, and better messages for common mistakes like calling a method on `nil`.

**Garbage collector improvements.** The GC in 4.0 is more efficient with memory fragmentation, which means long-running processes (like Sidekiq workers or Puma instances) hold steadier memory over time. We noticed this in our staging environment — one app that used to gradually climb from 300MB to 500MB over 24 hours now stays around 320MB.

## Should you upgrade?

If you're on Ruby 3.3 or 3.4, the upgrade is fairly smooth. We hit exactly one compatibility issue — a gem that was monkey-patching a core class method whose signature changed. The fix was a one-line version bump of the gem.

The upgrade path:

1. Update `.ruby-version` (or `.tool-versions` if you use mise like we do) to `4.0.1` or later
2. Run `bundle update` and fix any gem conflicts
3. Run your test suite and fix failures
4. Deploy to staging, let it soak for a few days
5. Ship it

If you're on Ruby 3.1 or earlier, you'll want to step through intermediate versions. Jumping straight from 3.0 to 4.0 is technically possible but you'll hit more deprecation removals than you want to deal with at once.

The biggest practical benefit of upgrading isn't any single feature — it's staying current. Gem authors are already dropping support for Ruby 3.1 and below. Security patches come to the latest versions first. And hiring is easier when your stack isn't three years behind.

We're running Ruby 4.0.1 across our active projects now and haven't looked back. If you need help with an upgrade, [we've done plenty of them](/schedule-a-call-with-us/).
