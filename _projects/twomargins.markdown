---
layout: project
date: 2023-01-03

name: TwoMargins

title: "TwoMargins: Crowdsourcing Financial Document Analysis for Wall Street"

card_description: Crowdsourcing Wall Street

project_url: https://www.twomargins.com/

description: We built TwoMargins — a financial document annotation platform featured in the Wall Street Journal — handling complex SEC document parsing with Nokogiri and supporting real-time collaborative analysis.

image: '/images/projects/twomargins/twomargins-hero.webp'

tags: [Ruby On Rails, PostgreSQL, Nokogiri]
label: Development
---

> The coolest, most constructive best-yet crowdsourcing effort to hit Wall Street
>
> <cite>-- Wall Street Journal</cite>

## About the project

TwoMargins set out to change how financial information is analyzed. The platform uses the wisdom of the crowd to help users gain financial insight — allowing analysts, investors, and researchers to annotate and discuss SEC filings and other financial documents collaboratively.

The concept sounds simple: upload financial documents and let users annotate and discuss them. In practice, the technical challenges were anything but simple.

## The hard problem: parsing SEC documents

SEC filings are not clean, well-structured HTML. They are dense, deeply nested documents with irregular formatting that varies between companies, filing types, and time periods. Building a system that could reliably parse these documents, preserve their structure, and overlay an annotation interface on top required solving a genuinely difficult engineering problem.

We built a Nokogiri-powered HTML parsing system specifically designed for this challenge. The parser needed to:

- Handle deeply and irregularly nested HTML without breaking document structure
- Preserve the original formatting so annotations could be anchored to specific passages
- Support documents ranging from a few pages to hundreds of pages in length
- Process new filings quickly when they became available (some document releases are time-sensitive market events)

## What we built

**Document ingestion pipeline:** We built an automated system that gathered data from SEC's EDGAR (Electronic Data Gathering, Analysis, and Retrieval) system. New filings were detected, downloaded, parsed, and made available on the platform with minimal delay.

**Annotation engine:** The core feature — the ability to select any passage in a financial document and attach annotations, comments, and analysis. This required a custom rendering layer that could map annotations to document positions accurately, even as different users worked on the same document simultaneously.

**Collaborative features:** TwoMargins was built for group analysis. Multiple users could annotate the same document, respond to each other's annotations, and build shared understanding of complex filings.

**External integrations:** As TwoMargins gained traction, we integrated the annotation interface into multiple external partner platforms — allowing the core functionality to be embedded in third-party financial tools and websites.

## Supporting a live product

Financial markets don't wait. Some of the most valuable moments for TwoMargins were during high-profile document releases — earnings reports, regulatory filings during U.S. presidential elections, and other market-moving publications. We supported the product team during these peak traffic events, ensuring the platform remained responsive when user activity spiked.

## Results

TwoMargins was featured in the Wall Street Journal as "the coolest, most constructive best-yet crowdsourcing effort to hit Wall Street." The platform attracted a community of financial analysts and investors who used it to collaboratively analyze some of the most important financial documents in the public markets.

## Our role

We were responsible for the full technical build: the document parsing pipeline, the annotation engine, the collaborative features, server infrastructure, and deployment. As the project matured, we also onboarded and trained new developers to ensure the team could continue building without us as a bottleneck.
