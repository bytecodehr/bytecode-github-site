---
layout: project
date: 2023-01-02

name: Shindig

title: "Shindig: A Fast-Turnaround Event Ticketing App with QR Check-In"

card_description: Increased Check-in Speed

project_url: https://shindig.bytecode.hr/

description: We built Shindig as a lightweight ticketing app with QR code scanning for fast event check-in — delivered on a tight deadline for the Fly Over automotive event in Croatia.

image: '/images/projects/shindig/shindig.webp'

tags: [Java, Play, PostgreSQL, Redis, AWS]
label: Development
---

## About the client

Clean Fellas is a European artisanal manufacturer of car cleaning products that helps car enthusiasts keep their vehicles in top condition. To boost the Croatian automotive scene, Clean Fellas partnered with enthusiasts across Europe to create Fly Over — an international event celebrating Croatia's automotive culture and community.

## The brief

Kresimir Mostarcic, Clean Fellas' CEO, came to us with a clear need: a simple ticketing application that could handle ticket creation, basic design customization, and — most importantly — speed up event check-in using QR code scanning. The event date was fixed, which meant we had a hard deadline and no room for scope creep.

We named the project Shindig.

## Technical challenges

The constraints shaped the architecture:

**Tight timeline:** We had limited time to deliver a fully functional application. This ruled out building a native mobile app for the QR scanner — instead, we built the entire experience as a responsive web application, including the scanning interface.

**Browser-based QR scanning:** One of the more interesting technical challenges was implementing a QR code reader that worked reliably in a web browser without requiring event staff to install a separate app. We integrated the Html5-QRcode library and optimized it for fast, consistent scanning on mobile devices — even in outdoor lighting conditions where camera-based scanning can be unreliable.

**Ticket design customization:** Event organizers needed the ability to customize ticket appearance with their branding. We built a template system that allowed basic design changes (colors, logos, layout) while keeping the QR code placement and sizing consistent for reliable scanning.

**Event analytics:** We created a real-time statistics dashboard that gave organizers visibility into ticket sales, check-in rates, and attendance patterns during the event.

## The stack

We built Shindig using Java with the Play framework, backed by PostgreSQL and Redis. AWS handled hosting and scaling. The Play framework's asynchronous request handling was well-suited for the real-time check-in workflow, where multiple staff members would be scanning tickets simultaneously.

## Results

Shindig was delivered on time and performed without issues at the Fly Over event. The browser-based QR scanner handled check-ins significantly faster than the manual process it replaced, reducing queues and improving the attendee experience.

Clean Fellas continues to use Shindig as their primary ticketing solution for events.

![Shindig CleanFellas Bytecode]({{site.baseurl}}/images/projects/shindig/flyover.webp)

## What this project demonstrates

Shindig is a good example of what focused execution looks like: a clear problem, a fixed deadline, pragmatic technical decisions (web app over native, existing libraries over custom solutions), and a result that solved the client's problem completely. Not every project needs to be a multi-year platform build — sometimes the highest value comes from delivering exactly what's needed, on time.
