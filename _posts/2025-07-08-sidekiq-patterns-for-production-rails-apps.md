---
layout: post
tags: [rails, sidekiq, ruby]
title: "Sidekiq Patterns We Actually Use in Production Rails Apps"
description: Battle-tested Sidekiq patterns from years of running background jobs in production. Covers job design, error handling, idempotency, and the configuration choices that keep things from falling apart at 3am.
date: 2025-07-08 10:00:00 +0200
---

We've been running Sidekiq in production across multiple client projects for years now. Some of those projects process a few hundred jobs a day. Others push through tens of thousands. Over time we've settled on a handful of patterns that keep things reliable without overcomplicating the setup.

None of this is groundbreaking. But we keep seeing the same mistakes in codebases we inherit, so it's worth writing down.

## Keep your jobs small and stupid

This is the one that causes the most pain when people get it wrong. A Sidekiq job should do one thing. Not "one thing and also send an email and maybe update a counter." One thing.

```ruby
# Bad: this job does three unrelated things
class OrderCompletedJob
  include Sidekiq::Job

  def perform(order_id)
    order = Order.find(order_id)
    order.update!(status: :completed)
    OrderMailer.confirmation(order).deliver_now
    Analytics.track("order_completed", order_id: order.id)
  end
end
```

If the mailer blows up, the analytics call never fires. If analytics times out, the whole job retries and sends a duplicate confirmation email. You've created a mess.

Break it up:

```ruby
class CompleteOrderJob
  include Sidekiq::Job

  def perform(order_id)
    order = Order.find(order_id)
    order.update!(status: :completed)

    SendOrderConfirmationJob.perform_async(order_id)
    TrackOrderAnalyticsJob.perform_async(order_id)
  end
end
```

Now each piece can fail and retry independently. The email can blow up without affecting analytics. This seems obvious when you read it, but we've lost count of how many "god jobs" we've untangled in client codebases.

## Make every job idempotent

Sidekiq will retry failed jobs. Your job might run twice. Or three times. Or twenty-five times if something is really broken. If your job isn't safe to run multiple times with the same arguments, you're going to have problems.

The classic example is charging a credit card:

```ruby
class ChargeCustomerJob
  include Sidekiq::Job

  def perform(order_id)
    order = Order.find(order_id)
    return if order.charged?

    result = PaymentGateway.charge(order.amount, order.payment_token)
    order.update!(charged_at: Time.current, charge_id: result.id)
  end
end
```

That `return if order.charged?` guard is doing all the heavy lifting. Without it, a retry means double-charging your customer. We've seen this happen in production on a project we inherited. It was not a fun conversation with the client.

For jobs that create records, use `find_or_create_by` or unique constraints in the database. Don't trust application-level checks alone — race conditions will get you eventually.

## Use queues to separate concerns, not priorities

We see a lot of setups where people create queues like `critical`, `high`, `medium`, `low` and think Sidekiq will process them in priority order. It sort of does, but not the way you'd expect. Sidekiq uses weighted random polling, not strict priority. A flooded `medium` queue can still starve `low`.

We prefer naming queues after what the jobs do:

```yaml
# config/sidekiq.yml
:concurrency: 10
:queues:
  - default
  - mailers
  - webhooks
  - reports
```

Then in your job:

```ruby
class WeeklyReportJob
  include Sidekiq::Job
  sidekiq_options queue: :reports

  def perform(account_id)
    # ...
  end
end
```

This way you can reason about what's in each queue just by looking at the name. And if report generation is crushing your workers, you can spin up a separate process that only handles the `reports` queue without touching the rest.

## Set sensible retry limits

Sidekiq defaults to 25 retries with exponential backoff. That means a failing job will keep retrying for about three weeks before landing in the dead set. For most jobs, that's way too aggressive.

We usually drop it to 5 or fewer and handle the dead letter queue explicitly:

```ruby
class ImportDataJob
  include Sidekiq::Job
  sidekiq_options retry: 3

  def perform(source_id)
    source = DataSource.find(source_id)
    # ... import logic
  end

  sidekiq_retries_exhausted do |msg, exception|
    source_id = msg["args"].first
    ErrorTracker.notify(exception, source_id: source_id)
    DataSource.find(source_id).update!(import_status: :failed)
  end
end
```

The `sidekiq_retries_exhausted` callback is something a lot of people don't know about. It fires after all retries are used up, giving you a clean place to mark records as failed, notify your error tracker, or alert someone.

## Don't pass full objects as arguments

This one bites people early on. You can technically pass a hash or even serialize an ActiveRecord object into Sidekiq arguments. Don't.

```ruby
# Bad: serialized object might be stale by the time job runs
SomeJob.perform_async(user.attributes)

# Good: pass the ID, load fresh data in the job
SomeJob.perform_async(user.id)
```

Sidekiq arguments get serialized to JSON and stored in Redis. By the time your job picks them up — could be milliseconds, could be minutes if the queue is backed up — the data might be stale. Always pass IDs and load the current state inside the job.

This also keeps your Redis memory usage sane. We once debugged a memory issue where someone was passing entire PDF blobs as job arguments. Redis was using 4GB.

## Monitor what matters

Sidekiq's web UI is fine for poking around, but for actual production monitoring we track three things:

1. **Queue latency** — how long jobs sit before being picked up. If this number is climbing, you're falling behind.
2. **Failed job rate** — a sudden spike means something is broken upstream, not that your jobs are bad.
3. **Dead set size** — jobs that exhausted all retries. This should be near zero. If it's not, you have a systemic problem.

We pipe these into whatever monitoring the client already uses. Sidekiq exposes stats through `Sidekiq::Stats` and `Sidekiq::Queue` which makes it easy to build a health check endpoint:

```ruby
# config/routes.rb
get "/health/sidekiq", to: proc {
  stats = Sidekiq::Stats.new
  latency = Sidekiq::Queue.new.latency

  if latency < 30 && stats.dead_size < 100
    [200, {}, ["OK"]]
  else
    [503, {}, ["DEGRADED latency=#{latency} dead=#{stats.dead_size}"]]
  end
}
```

Simple, but it's caught problems for us more than once before they became incidents.

## Wrapping up

There's more to say about Sidekiq — unique jobs, batches, rate limiting, cron scheduling with sidekiq-cron — but these basics cover maybe 90% of what goes wrong in the projects we work on. Get the fundamentals right and Sidekiq pretty much just works. Get them wrong and you'll spend your weekends reading retry logs.

If your Sidekiq setup has grown unwieldy and you need help untangling it, [we're happy to take a look](/schedule-a-call-with-us/).
