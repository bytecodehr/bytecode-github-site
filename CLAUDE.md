# Bytecode.hr — Redesign

## Goal

Full visual redesign of the Jekyll site **bytecode.hr** (a Ruby/React web consultancy) on the `redesign` branch. Modern, premium consultancy feel with a **dark emerald gradient + warm beige** color scheme.

## Stack

- **Ruby**: 4.0.1 (via mise, `.tool-versions`)
- **Jekyll**: 4.4.1
- **CSS**: Custom SCSS compiled inline via `{% include main.scss %}` → `scssify`
- **SCSS Architecture**: ITCSS — `0-settings/` → `1-tools/` → `2-base/` → `3-modules/` → `4-layouts/`
- **Grid**: Custom 12-column flexbox — breakpoints: `$wide: 1400px`, `$desktop: 1024px`, `$tablet: 768px`, `$mobile: 576px`
- **Font Awesome 6.4.2**: Inlined as SCSS in `_sass/1-tools/_font-awesome.scss`
- **Iconify 2.3.0**: CDN in head.html for tech gallery icons
- **Typography**: Inter (headings), Source Serif 4 (body)

## Build

```bash
mise exec -- bundle exec jekyll build
mise exec -- bundle exec jekyll serve
```

## Color Scheme

### Brand

| Token | Hex | Usage |
|---|---|---|
| `--brand` | `#059669` | Primary brand — buttons, links, accents |
| `--brand-hover` | `#047857` | Button/link hover states |
| `--brand-light` | `#ecfdf5` | Light tint backgrounds |
| `--brand-muted` | `#a7f3d0` | Subtle accents |
| `--accent` | `#f59e0b` | Warm amber complement (defined, rarely used) |

### Brand Gradient (`$brand-gradient`)

```
linear-gradient(135deg, #0f172a 0%, #0a2e1f 35%, #0d3a28 50%, #0a2e1f 65%, #0f172a 100%)
```

Dark slate → deep emerald → dark slate. Used on: hero, "View all" strips, footer CTA banner, author section.

### Dark Sections (hero, projects, gallery, footer CTA)

| Token | Hex | Usage |
|---|---|---|
| Slate 900 | `#0f172a` | Deepest background (gallery, projects title) |
| Slate 800 | `#1e293b` | Card bg on dark, subtle UI elements |
| Slate 700 | `#334155` | Borders on dark cards |
| Slate 500 | `#64748b` | Muted labels on dark |
| Slate 400 | `#94a3b8` | Body text on dark, "View all" link text |
| Slate 200 | `#e2e8f0` | Gallery labels on dark |
| Slate 100 | `#f1f5f9` | Headings/titles on dark |

### Beige Sections (blog, body, footer main)

| Token | Hex | Usage |
|---|---|---|
| Beige | `#faf6f1` | Main body background (`--background-color`) |
| Beige alt | `#f5efe7` | Alternate background (`--background-alt-color`) |
| Beige dark | `#efe8dd` | Alternate background 2 |
| Warm border | `#e7ddd0` | Borders, dividers on beige |
| Warm muted | `#94876e` | Small labels/captions on beige |
| Muted text | `#78716c` | Secondary body text on beige |
| Dark text | `#1e293b` | Headings on beige |
| White | `#fff` | Cards, inputs floating on beige |

### Project Card Accent Colors (cycle via `:nth-child(3n+N)`)

| Name | Card bg | Accent color | Usage |
|---|---|---|---|
| Indigo | `#131629` | `#818cf8` | Card 1 label, hover, button |
| Amber | `#1a1608` | `#fbbf24` | Card 2 label, hover, button |
| Rose | `#1f0c18` | `#f472b6` | Card 3 label, hover, button |

### Projects Title Area Gradient

```
linear-gradient(135deg, #0f172a 0%, #1a0f2e 30%, #1f0c28 60%, #1a1030 100%)
```

Slate blending into warm purple — bridges the hero and project cards.

## Design Rules

- **No blue** as primary — user explicitly rejected it
- **No cursive/Yellowtail** — Inter font throughout
- **No purple** as primary — emerald-tinted dark instead
- **Logo**: Bold "BYTECODE" wordmark in Inter 800 weight with emerald accent bar, via `_includes/logo.html`
- **Page pattern**: `.page-hero` (gradient banner with title) → `.page-body` (beige content area)
- **Project cards alternate** image position left/right via `:nth-child(even)` flex-direction reverse
- **Homepage projects**: Roomsie, RaceChip, Movieo (controlled via `date` field)
- **Services order in footer**: Consulting, Product Design, Web Application Development, Mobile Apps
- **Cookie preferences**: Small cookie icon button in footer bottom-right
- **Hero + Projects**: Wrapped in `.dark-flow` div sharing one gradient (no seam)
- **"View all" strips**: Full-width clickable `<a>` with gradient bg, 22px text, hover brightens

## Key Files

### SCSS (design system)
- `_sass/0-settings/_variables.scss` — `$brand-gradient`, typography tokens
- `_sass/0-settings/_color-scheme.scss` — CSS custom properties, all color tokens
- `_sass/3-modules/_hero.scss` — hero section (gradient, glow, CTA, image cards)
- `_sass/3-modules/_projects.scss` — project cards (accent colors, alternating layout)
- `_sass/3-modules/_article.scss` — blog section + blog footer strip
- `_sass/3-modules/_gallery.scss` — tech gallery (dark bg, brand-colored icons)
- `_sass/3-modules/_footer.scss` — CTA banner + beige footer
- `_sass/3-modules/_author.scss` — gradient CTA section
- `_sass/4-layouts/_post.scss` — page-hero + page-body pattern

### HTML templates
- `_includes/logo.html` — shared CSS text logo
- `_includes/section-hero.html` — hero with CTA button
- `_includes/section-projects.html` — project cards with "View all" footer
- `_includes/section-blog.html` — blog posts with "View all" footer
- `_includes/section-gallery.html` — Iconify tech icons
- `_includes/footer.html` — CTA banner, 3-col nav, cookie icon

### Content
- `_data/settings.yml` — all site config, gallery items with Iconify icons + brand colors
- `_projects/*.markdown` — project pages with `date` field controlling sort order

## TODO
- Placeholder legal pages (Privacy Policy, Cookie Policy, Terms of Service)
- Placeholder content in `_data/settings.yml` (testimonials, author bio, social links)
- Font Awesome bloat cleanup (~10K lines inlined)
- Hero images compression (2-6 MB each → webp)
- Mobile nav dropdown background adjustments
- Sass `@import` → `@use` migration (low priority)
