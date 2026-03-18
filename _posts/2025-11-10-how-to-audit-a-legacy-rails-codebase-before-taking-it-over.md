---
layout: post
tags: [rails, ruby]
title: "How to Audit a Legacy Rails Codebase Before Taking It Over"
description: A practical checklist for evaluating an inherited Rails application. What to look at first, which red flags actually matter, and how to estimate the real cost of taking over someone else's code.
date: 2025-11-10 10:00:00 +0200
---

We take over other people's Rails codebases fairly regularly. Sometimes it's a startup whose previous agency disappeared. Sometimes it's a company whose solo developer left and nobody else can make sense of the code. The situations differ but the process is the same.

Before we agree to work on anything, we run an audit. Not a formal, hundred-page document — just a structured look at the codebase to understand what we're getting into and give the client an honest assessment.

Here's how we do it.

## Check the Ruby and Rails versions first

This tells you more than anything else about the state of the project. Open the `Gemfile` and look at the Ruby version constraint and the Rails version:

```bash
head -5 Gemfile
grep 'rails' Gemfile
ruby -v  # or check .ruby-version
```

If the app is running Rails 5 or older, you're looking at a significant modernization effort before you can even start adding features. Rails 6 is manageable. Rails 7+ means someone was at least keeping things somewhat current.

The Ruby version matters too. Ruby 2.7 hit end-of-life a while ago. If the app is on 2.6 or earlier, a bunch of gems probably won't install on modern systems without patches.

We had a client last year running Rails 4.2 on Ruby 2.3. The previous team had pinned everything because upgrading broke things. Six months of dependency rot had turned into two years, then four. By the time we got involved, the upgrade path was a project unto itself.

## Read the Gemfile like a medical chart

The Gemfile tells you what the previous team valued, what they were worried about, and sometimes what they were struggling with.

Red flags we watch for:

- **Abandoned gems** — anything with no commits in 2+ years. Check the GitHub repo. If it's archived or the last issue response is from 2021, you'll be maintaining that dependency yourself.
- **Multiple gems doing the same thing** — two authentication libraries, three different pagination gems, both Sidekiq and Delayed Job. This usually means multiple developers worked on the project at different times without talking to each other.
- **Pinned to exact versions** — `gem 'nokogiri', '= 1.13.2'` with a comment like "DO NOT UPGRADE" is a sign that something broke once and nobody figured out why.
- **No test gems at all** — if there's no `rspec`, `minitest`, `capybara`, or `factory_bot` in the Gemfile, assume there are no tests. This changes the risk profile of every change you make.

```bash
# Quick way to spot outdated gems
bundle outdated --only-explicit
```

This shows you which direct dependencies are behind. If everything is 3+ major versions behind, the codebase hasn't been maintained in a while.

## Look at the database schema

The schema is the skeleton of the application. Open `db/schema.rb` (or `structure.sql` if they're using that) and scan through it.

What we look for:

```bash
# How big is this app, really?
grep "create_table" db/schema.rb | wc -l

# Any tables without timestamps?
grep -L "created_at" db/schema.rb
# (not a perfect check but catches obvious ones)

# Foreign keys defined?
grep "add_foreign_key" db/schema.rb | wc -l
```

A 200-table schema tells you something very different than a 15-table schema. Both can be messy, but the scale of mess matters for estimating work.

Missing indexes on foreign keys is the single most common performance issue we find. Look for columns ending in `_id` and check if they have indexes:

```bash
grep "_id" db/schema.rb | head -20
grep "add_index" db/schema.rb | wc -l
```

If there are 50 foreign key columns and 8 indexes, someone skipped the basics.

## Check for pending migrations and schema drift

```bash
bin/rails db:migrate:status
```

If there are `down` migrations in production, or if `schema.rb` doesn't match what the migrations would produce, you've got schema drift. This is more common than you'd think, especially in apps where people edited the schema file directly instead of writing migrations.

## Run the test suite (if it exists)

```bash
bundle exec rspec --format documentation 2>&1 | tail -20
```

Three outcomes:

1. **Tests pass** — Great. You have a safety net. Look at coverage next (`SimpleCov` or similar) to see how much of the app is actually tested.
2. **Tests fail** — Note how many and what kind. A few failures in feature specs might just be stale fixtures. Hundreds of failures means the test suite has been abandoned.
3. **Tests don't run at all** — Missing test database, missing environment variables, gem conflicts. This is the most common scenario in inherited codebases. If you can't even get the test suite to boot, the original team probably couldn't either.

Don't spend more than 30 minutes trying to get tests running during the audit. If it takes longer than that, just note it as a risk factor and move on.

## Look at the git history

The commit history reveals the project's real story:

```bash
# Who worked on this and when?
git shortlog -sn --all

# When was the last commit?
git log -1 --format="%ai"

# What does a typical commit look like?
git log --oneline -20
```

If the commit history is all "fix", "update", "wip", "asdf" — that's a signal about the development culture. Not necessarily a dealbreaker, but it means there's no audit trail for why decisions were made.

Check for large gaps in commit dates. A project with steady commits through 2023 and then nothing until you got the call usually means the previous team burned out or got fired mid-sprint.

## Check for secrets and security basics

This takes two minutes and we're always surprised by what we find:

```bash
# Look for hardcoded secrets
grep -r "password\|secret\|api_key\|token" config/ --include="*.rb" -l
grep -r "ENV\[" config/ | head -20

# Is credentials.yml.enc being used?
ls config/credentials.yml.enc
ls config/master.key
```

If you see database passwords in `database.yml`, API keys in initializers, or a `master.key` committed to the repo — flag it immediately. We've seen production Stripe keys sitting in plain text in `config/initializers/stripe.rb` more times than we'd like to admit.

## Estimate the real cost

After all of this, we put together a rough picture:

- **Green**: Modern Rails/Ruby, tests pass, clean schema, recent commits. You can start adding features right away.
- **Yellow**: A version or two behind, some test failures, minor dependency rot. Budget 2-4 weeks of stabilization before feature work.
- **Red**: Ancient Rails/Ruby, no tests, abandoned dependencies, security issues. The "upgrade" might cost more than a rewrite. Be honest with the client about this.

The hardest conversation is telling a client that their existing codebase — the one they paid good money for — isn't worth saving. But it's better to have that conversation upfront than three months into a failed rescue mission.

We always write up our findings in a short document. Nothing formal — just a bulleted list of what we found, what's risky, and a rough estimate of stabilization work. It takes maybe an hour after the audit itself and it gives the client something concrete to make decisions with.

If you've inherited a Rails codebase and want a second opinion, [that's exactly the kind of engagement we do well](/schedule-a-call-with-us/).
