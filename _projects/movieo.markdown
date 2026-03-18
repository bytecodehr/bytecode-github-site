---
layout: project
date: 2024-03-01

name: Movieo

title: "Movieo: A Movie Discovery App Reaching 100,000 Monthly Visitors"

project_url: https://www.movieo.me/

card_description: 100,000 monthly visitors

description: Movieo is our in-house side project — a movie discovery app that ranks 250,000+ films using a combined IMDb, Rotten Tomatoes, and Metacritic score. It now serves 100,000 monthly visitors with zero marketing spend.

image: '/images/projects/movieo/movieo.webp'

tags: [Ruby On Rails, PostgreSQL, Redis, Nokogiri]
label: Development
---

## The beginning

After delivering two back-to-back client applications in late 2014, we decided to take a couple of months off to work on a side project. The motivation was simple: we both loved movies but hated the process of finding something worth watching. Every existing movie site was cluttered, ad-heavy, or relied on a single rating source. We wanted something better.

We skipped market research and jumped straight into design — this was a passion project, built to scratch our own itch. We started by sketching out different filtering interfaces, then refined what we thought was the cleanest approach: a simple, intuitive filtering system that encouraged exploration, with films ranked by a composite score combining IMDb, Rotten Tomatoes, and Metacritic ratings.

## Technical architecture

Building Movieo required solving a data problem first. To deliver a smooth, responsive browsing experience, we needed all movie data available in our own database — relying on third-party API calls at request time would have been too slow.

**Data pipeline:** We built a Nokogiri-powered import system that pulled data from the TMDB and OMDB APIs, normalizing and merging records for over 250,000 films. The system runs daily, automatically importing new releases and updating scores, cast information, and metadata for existing titles.

**Search and filtering:** The core user experience is a multi-dimensional filtering interface — users can combine genre, year range, rating thresholds, and other criteria to narrow results instantly. This required careful database indexing and query optimization to keep response times under 100ms even for complex filter combinations.

**Composite scoring:** Our ranking algorithm weights scores from IMDb, Rotten Tomatoes, and Metacritic to produce a single "worth watching" score. This turned out to be one of Movieo's strongest differentiators — users quickly learned to trust the composite score as a reliable quality signal.

**Infrastructure:** Rails on the back-end, PostgreSQL for storage, Redis for caching frequently accessed queries and film data. The entire stack is optimized to serve pages quickly — important for user experience and SEO alike.

## Growth without marketing

We launched Movieo publicly without any real marketing effort. The product's growth has been entirely organic — driven by word of mouth, strong SEO performance from our large catalog of film pages, and occasional mentions on Reddit and film forums.

Today, Movieo serves roughly 100,000 people every month. The numbers continue to climb steadily despite the fact that we haven't actively promoted it in years. This tells us two things: the product solves a real problem, and the technical foundation we built — fast pages, reliable data, useful filtering — keeps people coming back.

## What we learned

Movieo taught us things that client work alone couldn't. We experienced every phase of the product lifecycle firsthand: ideation, design, development, launch, user feedback, iteration, and long-term maintenance. We learned how to optimize for organic traffic, how to build data pipelines that run reliably for years, and how to make architectural decisions that hold up at scale.

The experience directly made us better consultants. When we advise clients on product development, we speak from the perspective of founders who have been through it ourselves.

## The path forward

We remain actively involved with Movieo, continuously improving the data pipeline, refining the scoring algorithm, and adding features that make movie discovery faster and more enjoyable.
