---
layout: project
date: 2023-01-04

name: SessionM

title: "SessionM: Building a Data Ingestion System for a Customer Engagement Platform"

project_url: https://www.mastercard.com/news/press/2019/march/mastercard-acquires-sessionm/

card_description: Data ingestion platform

description: We built a data ingestion system for SessionM, a customer engagement and loyalty platform later acquired by Mastercard, processing high-volume customer interaction data at scale.

image: '/images/projects/sessionm/sessionm.webp'

tags: [Ruby On Rails, PostgreSQL, Redis]
label: Development
---

## About SessionM

SessionM is a customer engagement and loyalty platform that helps brands build stronger relationships with their customers through data-driven personalization. The platform connects customer interaction data across touchpoints — in-store, online, and mobile — to power targeted loyalty programs, offers, and experiences. The company was later acquired by Mastercard, where its technology became part of Mastercard's broader data and services capabilities.

## What we built

We designed and built a data ingestion system for SessionM. The system was responsible for receiving, validating, and processing high volumes of customer interaction data flowing into the platform from multiple sources.

The core challenge was reliability. When you're ingesting data that drives loyalty programs and personalized customer experiences, every missed record or processing delay has a direct business impact. The system needed to handle variable throughput gracefully, maintain data integrity through the entire pipeline, and surface issues quickly when something went wrong.

## Processing at volume

The ingestion system we built handled the continuous flow of customer events — purchases, interactions, profile updates — transforming raw input into structured data the platform could act on. We focused on building a pipeline that was resilient to upstream inconsistencies, could recover cleanly from failures, and scaled with the growing data volumes SessionM was processing.

## The outcome

The data ingestion system became a foundational piece of SessionM's infrastructure, supporting the platform's ability to deliver real-time personalization at scale. When Mastercard acquired SessionM in 2019, the systems we helped build were part of the technology stack that made the acquisition valuable.
