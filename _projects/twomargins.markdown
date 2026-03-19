---
layout: project
date: 2023-01-03

name: TwoMargins

title: "TwoMargins: Crowdsourcing Financial Document Analysis for Wall Street"

card_description: Crowdsourcing Wall Street

project_url: https://www.twomargins.com/

description: We built TwoMargins — a financial document annotation platform featured in the Wall Street Journal — handling complex SEC document parsing with Nokogiri and supporting real-time collaborative analysis. Bloomberg used the platform to publish their annotated edition of Warren Buffett's 2015 shareholder letter.

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

## Bloomberg and the Buffett letter

When Warren Buffett published his 2015 annual letter to Berkshire Hathaway shareholders, Bloomberg chose TwoMargins as the platform for their [annotated interactive edition](https://web.archive.org/web/20160320114353/http://www.bloomberg.com/news/features/2016-02-27/warren-buffett-s-2015-shareholder-letter-annotated). Luke Kawa at Bloomberg Business wrote the annotations, and readers could follow along, highlight passages, and add their own commentary directly on the document through [TwoMargins' annotation layer](https://web.archive.org/web/20160320094656/https://www.twomargins.com/c/Warren-Buffett's-2015-Letter-To-Shareholders-gzbhjk).

This was one of the highest-profile uses of the platform. The original 30-page shareholder letter — converted from a PDF into annotatable HTML through our Nokogiri parsing pipeline — handled thousands of concurrent readers during the initial publication window. Each page of the letter was rendered as structured HTML with annotation anchors, preserving the original formatting (Times New Roman, tabular financial data, indented paragraphs) while enabling the collaborative overlay.

The document metadata tells the story: document ID 127694, created February 27, 2016 (the day the letter was released), flagged as featured content with restricted editing access — only Bloomberg's editorial team could post primary annotations, while the public could reply and discuss.

## The hard problem: parsing SEC documents

SEC filings are not clean, well-structured HTML. They are dense, deeply nested documents with irregular formatting that varies between companies, filing types, and time periods. Building a system that could reliably parse these documents, preserve their structure, and overlay an annotation interface on top required solving a genuinely difficult engineering problem.

We built a Nokogiri-powered HTML parsing system specifically designed for this challenge. The parser needed to:

- Handle deeply and irregularly nested HTML without breaking document structure
- Preserve the original formatting so annotations could be anchored to specific passages
- Support documents ranging from a few pages to hundreds of pages in length
- Process new filings quickly when they became available (some document releases are time-sensitive market events)

The Buffett letter was a perfect example of the complexity: a 30-page PDF converted via BCL easyConverter SDK into HTML with 30 distinct page divs, each containing multiple nested content blocks, table layouts for financial data, and precise positional CSS. Our parser had to ingest this structure, normalize it for the annotation engine, and serve it through a real-time collaborative layer — all without breaking any of the formatting that made the financial tables readable.

## What we built

**Document ingestion pipeline:** We built an automated system that gathered data from SEC's EDGAR (Electronic Data Gathering, Analysis, and Retrieval) system. New filings were detected, downloaded, parsed, and made available on the platform with minimal delay. For user-uploaded documents like the Buffett letter, the pipeline handled arbitrary HTML structures with the same reliability.

**Annotation engine:** The core feature — the ability to select any passage in a financial document and attach annotations, comments, and analysis. Built on the Annotator.js library with a custom Store plugin, the system mapped text selections to document positions, persisted them via a Rails JSON API, and rendered highlighted passages with annotation counts. The engine supported threaded replies, so annotations became discussions.

**Collaborative features:** TwoMargins was built for group analysis. Multiple users could annotate the same document, respond to each other's annotations, and build shared understanding of complex filings. Social authentication (Twitter, Google, StockTwits) lowered the barrier to participation, and guest posting allowed anonymous contributions.

**Embeddable annotation layer:** The platform supported oEmbed and iframely standards, so the annotation interface could be embedded in third-party sites — which is exactly how Bloomberg used it. Their feature article linked directly to the TwoMargins-hosted annotated document.

## Supporting a live product

Financial markets don't wait. Some of the most valuable moments for TwoMargins were during high-profile document releases — earnings reports, regulatory filings during U.S. presidential elections, and other market-moving publications. The Bloomberg Buffett letter was one of the biggest: a featured article on Bloomberg.com driving traffic to an annotation layer we hosted and maintained. We supported the product team during these peak traffic events, ensuring the platform remained responsive when user activity spiked.

## Results

TwoMargins was featured in the Wall Street Journal as "the coolest, most constructive best-yet crowdsourcing effort to hit Wall Street." Bloomberg chose the platform for their marquee annotated Buffett letter. The platform attracted a community of financial analysts and investors who used it to collaboratively analyze some of the most important financial documents in the public markets.

## Our role

We were responsible for the full technical build: the document parsing pipeline, the annotation engine, the collaborative features, server infrastructure, and deployment. As the project matured, we also onboarded and trained new developers to ensure the team could continue building without us as a bottleneck.
