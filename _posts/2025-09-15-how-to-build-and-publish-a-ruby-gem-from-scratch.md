---
layout: post
tags: [ruby, gems]
title: "How to Build and Publish a Ruby Gem from Scratch"
description: A practical walkthrough of building a Ruby gem from an empty directory to a published package on RubyGems.org. No magic, no hand-waving — just the actual steps and the files you need.
date: 2025-09-15 10:00:00 +0200
---

We've published a handful of gems over the years, mostly internal tools that eventually became useful enough to open source. Every time we start a new one, we forget some small detail and end up re-reading the same docs. So we're writing this down once and for all.

This walks through creating a gem from scratch, without using `bundle gem` to scaffold it. Not because there's anything wrong with that command — it's great — but because understanding what each file actually does makes you a better gem author. You can always use the generator next time.

## Start with the directory structure

A minimal gem needs surprisingly few files. Here's the structure we're going to build:

```
string_caser/
  lib/
    string_caser/
      version.rb
    string_caser.rb
  string_caser.gemspec
  Gemfile
  README.md
```

That's it. Everything else — tests, CI config, a changelog — is important but optional for getting a gem published.

Let's say we're building a gem called `string_caser` that adds some case conversion methods. Contrived, sure, but it keeps the focus on the packaging rather than the code.

## The gemspec

This is the most important file. It tells RubyGems everything about your gem — name, version, what files to include, what dependencies it needs.

```ruby
# string_caser.gemspec
require_relative "lib/string_caser/version"

Gem::Specification.new do |spec|
  spec.name          = "string_caser"
  spec.version       = StringCaser::VERSION
  spec.authors       = ["Your Name"]
  spec.email         = ["you@example.com"]

  spec.summary       = "Case conversion utilities for Ruby strings"
  spec.description   = "Adds underscore_case, camelCase, and kebab-case conversions."
  spec.homepage      = "https://github.com/yourname/string_caser"
  spec.license       = "MIT"

  spec.required_ruby_version = ">= 3.1.0"

  spec.files = Dir["lib/**/*.rb", "README.md", "LICENSE.txt"]
  spec.require_paths = ["lib"]
end
```

A few things worth noting. The `spec.files` line is where people mess up most often. If you forget to include a file here, it won't be in the published gem even though it's in your repo. We've shipped gems with missing files more than once because of this. The `Dir` glob approach is safer than listing files manually.

Also: set `required_ruby_version`. Gem users will thank you when they get a clear error instead of some cryptic syntax failure on an older Ruby.

## The version file

Keep your version in its own file so the gemspec can reference it without loading your entire library:

```ruby
# lib/string_caser/version.rb
module StringCaser
  VERSION = "0.1.0"
end
```

Boring but necessary.

## The main library file

This is what gets loaded when someone does `require "string_caser"`:

```ruby
# lib/string_caser.rb
require_relative "string_caser/version"

module StringCaser
  def self.to_snake_case(str)
    str.gsub(/([A-Z]+)([A-Z][a-z])/, '\1_\2')
       .gsub(/([a-z\d])([A-Z])/, '\1_\2')
       .downcase
       .tr("-", "_")
  end

  def self.to_kebab_case(str)
    to_snake_case(str).tr("_", "-")
  end

  def self.to_camel_case(str)
    str.split(/[_\-\s]+/).map(&:capitalize).join
  end
end
```

Nothing fancy. The implementation doesn't matter for this guide — what matters is the structure. One entry point file that requires sub-files as needed.

## The Gemfile

Your gem's own Gemfile is simple:

```ruby
# Gemfile
source "https://rubygems.org"
gemspec
```

That `gemspec` line tells Bundler to pull dependencies from your `.gemspec` file. Don't duplicate them. We've seen Gemfiles that list every dependency twice — once in the gemspec, once in the Gemfile. Pick one source of truth. The gemspec is it.

## Adding tests

You should test your gem. We use Minitest because it comes with Ruby and has zero setup, but RSpec works fine too.

```ruby
# test/test_string_caser.rb
require "minitest/autorun"
require "string_caser"

class TestStringCaser < Minitest::Test
  def test_snake_case
    assert_equal "hello_world", StringCaser.to_snake_case("HelloWorld")
    assert_equal "foo_bar_baz", StringCaser.to_snake_case("fooBarBaz")
  end

  def test_kebab_case
    assert_equal "hello-world", StringCaser.to_kebab_case("HelloWorld")
  end

  def test_camel_case
    assert_equal "HelloWorld", StringCaser.to_camel_case("hello_world")
  end
end
```

Run with `ruby test/test_string_caser.rb`. Done. No Rake tasks needed at this stage, though you'll probably want a Rakefile eventually.

## Building the gem locally

Before publishing, build it locally and make sure everything looks right:

```bash
gem build string_caser.gemspec
```

This produces a file like `string_caser-0.1.0.gem`. You can inspect what's inside:

```bash
tar -tf string_caser-0.1.0.gem
# data.tar.gz
# metadata.gz
# checksums.yaml.gz
```

And you can install it locally to test:

```bash
gem install ./string_caser-0.1.0.gem
```

Then open `irb` and try `require "string_caser"`. If it loads without errors, you're good.

## Publishing to RubyGems

First time? You'll need an account at [rubygems.org](https://rubygems.org) and to set up your API key:

```bash
gem signin
```

This stores your credentials in `~/.gem/credentials`. Then push:

```bash
gem push string_caser-0.1.0.gem
```

That's genuinely it. Your gem is live. People can `gem install string_caser` now.

For subsequent releases, bump the version in `version.rb`, rebuild, and push again. We keep a simple script for this:

```bash
#!/bin/bash
gem build string_caser.gemspec && gem push string_caser-*.gem && rm string_caser-*.gem
```

## Things we always forget (so you don't have to)

**Add a LICENSE file.** Seriously. Without one, your gem is technically "all rights reserved" regardless of what the gemspec says. MIT is the standard choice for Ruby gems.

**Don't include test files in the gem.** That `spec.files` glob matters. `Dir["lib/**/*.rb"]` excludes your test directory, which is what you want. Nobody needs your test suite taking up space in their vendor bundle.

**Pin your dependencies loosely.** If your gem depends on `activesupport`, use `spec.add_dependency "activesupport", ">= 6.0"` rather than pinning to a specific version. Let the consuming application decide what version to use.

**Set up a `.gemignore` or use `spec.files` carefully.** We once accidentally shipped a gem with a 40MB fixture file because we used `git ls-files` without thinking. Check the file size of your built `.gem` before pushing.

**Use `bundle exec rake release` if you use Bundler.** Once you're comfortable with the manual process, Bundler's release task handles version tagging, gem building, and pushing in one step. It's what we use day-to-day.

## That's the whole thing

Building a gem isn't complicated. The tooling has been stable for over a decade. The hard part isn't the packaging — it's deciding what's worth extracting into a gem in the first place.

Our rule of thumb: if we've copied the same module into three different projects, it's time to make it a gem. Anything less and it's probably not worth the maintenance overhead.
