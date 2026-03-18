---
layout: project
date: 2023-01-01

name: Fanjolt

title: "Fanjolt: Building a Celebrity-Fan Interaction Platform with 1,000+ Users"

project_url: https://www.fanjolt.com/

card_description: 1,000+ Happy fans

description: We built Fanjolt from the ground up — a Ruby on Rails marketplace connecting fans with celebrities for personalized video messages, live interactions, and charity-driven experiences.

image: '/images/projects/fanjolt/fanjolt-hero.jpeg'

tags: [Ruby On Rails, PostgreSQL, Redis, Heroku, Sidekiq]
label: Development
---

## The concept

Fanjolt set out to bridge the gap between celebrities and their fans. The idea was straightforward: give fans a way to book personalized video messages, live calls, and exclusive experiences with a curated roster of athletes, musicians, and public figures — with a portion of every transaction going to the talent's chosen charity.

The founding team had a clear vision but needed a technical partner who could move fast and build a product robust enough to handle real-money transactions and time-sensitive fulfillment workflows.

## What we built

We designed and developed the entire Fanjolt platform as a two-sided marketplace. The core architecture had to handle several distinct workflows simultaneously:

**For fans:**
- Browse and discover talent across categories (sports, entertainment, music)
- Book personalized video messages with specific instructions
- Purchase live video call slots and exclusive experiences
- Track request status from purchase through delivery

**For talent:**
- Manage availability and pricing for different interaction types
- Record and submit personalized video messages
- Accept or decline requests within a defined time window
- Track earnings and charitable donation allocation

**Behind the scenes:**
- Sidekiq-powered background job system for video processing, email notifications, and fulfillment deadline tracking
- Redis-backed caching layer to handle traffic spikes during talent promotions
- Automated refund processing when fulfillment deadlines expire
- Stripe Connect integration for split payments between platform, talent, and charity

## Technical decisions

We chose Ruby on Rails for its rapid development cycle — critical for a startup that needed to iterate quickly based on early user feedback. PostgreSQL gave us the relational integrity needed for financial transactions, while Redis + Sidekiq handled the asynchronous processing that made the platform feel responsive even during peak load.

The video processing pipeline was one of the more complex pieces. Uploaded videos needed to be transcoded into multiple formats, thumbnailed, and delivered to fans within minutes of talent submission. We built a multi-stage pipeline that could handle this without blocking the main application.

## Results

Within months of launch, Fanjolt had onboarded dozens of talent profiles and served over 1,000 fans with personalized interactions. The platform processed transactions reliably, maintained sub-second response times, and scaled without incident during promotional pushes.

The charity component proved to be a strong differentiator — talent were more willing to participate knowing their fans' purchases supported causes they cared about.

## Our role

We were responsible for the full technical build: database architecture, API design, payment integration, background job infrastructure, deployment pipeline, and ongoing maintenance. We worked directly with the Fanjolt founding team throughout, advising on product decisions where our technical perspective could reduce scope without sacrificing the user experience.
