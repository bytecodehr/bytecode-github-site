---
layout: post
tags: [rails, deployment]
title: "Migrating Off Heroku: A Rails Developer's Guide to DigitalOcean, Hetzner, Hatchbox, and Kamal"
description: Heroku got expensive and the free tier is gone. Here are the hosting alternatives we actually use for Rails apps — DigitalOcean, Hetzner, Hatchbox.io, and Kamal — with real config examples and honest trade-offs.
date: 2026-03-05 10:00:00 +0200
---

Heroku was the default for Rails deployment for over a decade. `git push heroku main` and you were live. That simplicity was worth paying for. But the free tier is gone, the pricing has gotten steep for what you get, and the platform feels like it's been coasting on reputation for a while now.

We've migrated several client apps off Heroku over the past couple of years. Some were small side projects, others were production apps handling real traffic. We've landed on a few options we keep coming back to, depending on the situation.

## The landscape in 2026

There's no single "Heroku replacement." What you pick depends on how much infrastructure you want to manage and what your budget looks like.

Here's how we think about it:

- **Want Heroku-level simplicity?** Use Hatchbox.
- **Want full control with modern tooling?** Use Kamal on DigitalOcean or Hetzner.
- **Want the cheapest option that still works?** Hetzner VPS with Kamal.

Let's walk through each.

## Hatchbox: the closest thing to Heroku

[Hatchbox.io](https://hatchbox.io) is built specifically for Rails developers. You connect it to your DigitalOcean or Hetzner account, point it at a repo, and it handles deploys, SSL certificates, database backups, and process management. It runs on your own servers, but you don't have to think about server configuration.

The setup is genuinely fast. You sign up, connect your cloud provider, create a "cluster" (which is just a server), and add your app. Hatchbox provisions the server, installs Ruby, sets up Nginx, configures Let's Encrypt, and gives you a deploy button.

What we like about it:

- **You own the servers.** Your app runs on a DigitalOcean droplet or Hetzner VPS that you control. If Hatchbox disappeared tomorrow, your app would still be running.
- **Rails-native.** It understands Puma, Sidekiq, Action Cable, credentials. You don't have to translate Rails conventions into generic container concepts.
- **Managed PostgreSQL and Redis.** You can use managed databases from your cloud provider or let Hatchbox install them on the server.
- **Affordable.** Hatchbox itself is $10/month per cluster. Pair that with a $6/month DigitalOcean droplet or a Hetzner VPS and you're spending a fraction of what Heroku charges.

The main limitation is scale. Hatchbox works great up to maybe 3-4 servers. Beyond that, you'll want something more infrastructure-oriented.

For a typical client project — a Rails app with Sidekiq, PostgreSQL, and Redis — we can go from Heroku to Hatchbox in an afternoon. The deploy workflow changes from `git push heroku` to clicking a button in the Hatchbox dashboard (or setting up a GitHub webhook for auto-deploy).

## Kamal: 37signals' answer to deployment

Kamal came out of 37signals (the Basecamp/HEY people) and it's what they use to deploy their own apps. It's a command-line tool that deploys Docker containers to any server you can SSH into. No Kubernetes, no orchestration platform — just Docker on a VPS.

The killer feature is zero-downtime deploys on bare servers. Kamal uses a reverse proxy called Kamal Proxy that routes traffic between the old and new containers during deployment. Your users never see downtime.

Here's what a minimal `config/deploy.yml` looks like:

```yaml
service: myapp
image: myorg/myapp

servers:
  web:
    hosts:
      - 159.69.123.45
    options:
      network: "private"
  worker:
    hosts:
      - 159.69.123.45
    cmd: bundle exec sidekiq

proxy:
  ssl: true
  host: myapp.com

registry:
  username: myorg
  password:
    - KAMAL_REGISTRY_PASSWORD

builder:
  arch: amd64

env:
  secret:
    - RAILS_MASTER_KEY
    - DATABASE_URL
    - REDIS_URL
```

Deploy with:

```bash
kamal setup    # first time: installs Docker, sets up proxy
kamal deploy   # subsequent deploys
```

Kamal builds your Docker image, pushes it to a registry, pulls it on your server, and cuts over traffic. The whole process takes a couple of minutes.

We pair Kamal with Hetzner for most new projects. A Hetzner CX22 (2 vCPU, 4GB RAM) costs about EUR 4/month. That's not a typo. For a Rails app with moderate traffic, a single Hetzner box running your app, Sidekiq, PostgreSQL, and Redis is more than enough — and it costs less per month than a single Heroku dyno.

What you give up compared to Hatchbox is the managed experience. With Kamal, you're responsible for server updates, monitoring, database backups, and log management. You need a Dockerfile. You need to understand DNS, SSL, and basic Linux ops. For teams that are comfortable with that, it's hard to beat.

## DigitalOcean vs Hetzner: picking your VPS provider

Both work well. The choice comes down to geography and budget.

**DigitalOcean** has data centers in the US, Europe, and Asia. Their managed database offering is solid and saves you from running PostgreSQL yourself. The App Platform is another option if you want something more managed — it's essentially DigitalOcean's answer to Heroku, with Dockerfile-based deploys and managed databases.

A typical DigitalOcean setup for a Rails app:

- 1x Droplet ($12/month, 2GB RAM) for the app
- 1x Managed PostgreSQL ($15/month, basic plan)
- 1x Managed Redis ($15/month, basic plan)

Total: about $42/month. Compare that to Heroku where a single Standard dyno ($25) plus Heroku Postgres Standard ($50) plus Redis ($15) puts you at $90/month minimum.

**Hetzner** is the budget option, and we mean that as a compliment. Their servers are in Germany and Finland, which is perfect for European clients. The pricing is absurdly competitive:

- 1x CX22 (2 vCPU, 4GB RAM): EUR 3.99/month
- Or CX32 (4 vCPU, 8GB RAM): EUR 7.49/month

The catch is you're managing everything yourself — no managed database offering as polished as DigitalOcean's. But if you're using Kamal, you're already in the "I'll manage my own stuff" mindset.

For our European clients, we've been defaulting to Hetzner + Kamal. The price-to-performance ratio is unmatched and the network quality is excellent.

## The actual migration checklist

Regardless of which option you pick, the migration process follows the same rough outline:

**1. Get your app running in Docker first.** Do this while still on Heroku. Add a `Dockerfile` to your project and make sure it builds:

```dockerfile
FROM ruby:4.0.1-slim

RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs npm && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /rails
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY . .
RUN bundle exec rails assets:precompile

EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

**2. Extract your environment variables.** Heroku stores them in config vars. List them all:

```bash
heroku config -a your-app-name
```

You'll need to recreate these in your new environment — as `.env` files, Kamal secrets, or Hatchbox environment variables.

**3. Export your database.** For PostgreSQL:

```bash
heroku pg:backups:capture -a your-app-name
heroku pg:backups:download -a your-app-name
pg_restore --no-owner -d your_new_database latest.dump
```

**4. Update your DNS.** Point your domain to the new server's IP. If you're nervous about the cutover, lower the TTL on your DNS records a few days in advance so changes propagate faster.

**5. Set up SSL.** Both Hatchbox and Kamal handle Let's Encrypt automatically. Hatchbox does it out of the box. With Kamal, it's configured in `deploy.yml` under the `proxy` key.

**6. Set up backups and monitoring.** This is the part people forget. On Heroku, database backups were automatic. On your own server, you need to set them up yourself. A simple cron job with `pg_dump` piped to an offsite location works. For monitoring, even a basic uptime check from something like UptimeRobot gives you the safety net you had on Heroku.

## Which one would we pick?

For a client who wants to deploy and forget: **Hatchbox on DigitalOcean.** It's the closest to the Heroku experience at a quarter of the price.

For a technical team that wants control: **Kamal on Hetzner.** Maximum flexibility, minimum cost, and the deploy workflow is genuinely pleasant once you've got it set up.

For something in between: **Kamal on DigitalOcean** with managed databases. You get the control of Kamal with the convenience of not running your own PostgreSQL.

The Heroku era was good while it lasted. But the alternatives have caught up, and in most cases they're cheaper, faster, and give you more control. There's really no reason to stay unless `git push heroku` is the only deployment workflow your team is willing to learn.

If you're sitting on a Heroku bill that makes you wince every month, [we can help you migrate](/schedule-a-call-with-us/). We've done it enough times to know where the gotchas are.
