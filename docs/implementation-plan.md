# Implementation Plan: Compare Anything

This document details the end-to-end implementation roadmap for **Compare Anything – AI Web Comparison**, structured across 5 distinct developmental phases following Section 47 of the project specification.

---

## Phase 1: Core Foundation & Manifest V3 Scaffolding (Day 1)
- [x] **Task 1.1: Project Scaffolding**
  - Initialize Vite + React + TypeScript extension boilerplate.
  - Configure TailwindCSS and PostCSS with customized dark-mode palette.
  - Create MV3 `manifest.json` declaring permissions: `activeTab`, `scripting`, `storage`.
  - *Verification:* `npm run build` succeeds and compiles `manifest.json`, `index.html`, and assets.
- [x] **Task 1.2: Extension Architecture & Multi-Entry Setup**
  - Configure `vite.config.ts` with multi-page entries: `popup (index.html)`, `results (results.html)`, `background (serviceWorker.ts)`, `content (PageExtractor.ts)`.
  - Ensure background script is isolated with `type: "module"`.
  - *Verification:* Output directory contains standalone `background.js` and `content.js` without inline script violations.

---

## Phase 2: Content Extraction, Storage & State Management (Day 2)
- [x] **Task 2.1: DOM & Text Content Extractor**
  - Build `PageExtractor.ts` injected via `chrome.scripting.executeScript`.
  - Extract structured data (`JSON-LD`, `<meta>` tags, `<h1>`-`<h3>`, priority tables, and body text).
  - Clean extraneous whitespace and enforce ≤ 3,500 character snapshot ceiling.
  - *Verification:* Test on commercial e-commerce, documentation, and pricing pages; verify extracted payload structure.
- [x] **Task 2.2: Typed Storage Layer**
  - Implement `compareStorage.ts` wrapping `chrome.storage.local`.
  - Enforce bounds: minimum 2, maximum 4 pages.
  - Prevent duplicate URLs from being stored.
  - *Verification:* Verify tab add/remove and persistence across popup closure.
- [x] **Task 2.3: Backend API Architecture**
  - Set up Laravel API controller `CompareController` at `POST /api/v1/compare` and `POST /api/compare`.
  - Validate payload schema: `installId` (UUID/string), `goal` (optional string), `pages` (array of 2–4 items).
  - Implement IP hourly (30 req/hr) and installId daily (10 req/day) rate limits via Laravel `RateLimiter`.
  - *Verification:* Run mock requests and verify HTTP 422 for invalid payloads and HTTP 429 for rate limit breaches.

---

## Phase 3: AI Provider Integration & Interactive Results Matrix (Day 3)
- [x] **Task 3.1: Groq Cloud AI Integration**
  - Implement `ComparisonService.php` communicating with Groq API.
  - Enforce strict JSON object response format (`response_format: { type: "json_object" }`).
  - Add fallback logic to OpenRouter if primary provider is unavailable.
  - *Verification:* Verify valid JSON response conforming to schema with `comparisonTitle`, `items`, `criteria`, `bestOverall`.
- [x] **Task 3.2: Full-Page Comparison Interface (`results.html`)**
  - Build `Results.tsx` loading `latestComparison` from storage.
  - Render Quick Verdict card with best overall recommendation.
  - Render side-by-side criteria matrix table.
  - Render "Key Differences" and "Missing Information" grids.
  - *Verification:* Open results tab and verify rendering of 2, 3, and 4 items.
- [x] **Task 3.3: Data Export Capabilities**
  - Implement `copyAsMarkdown(data)` utility to format results into clean GitHub-flavored Markdown.
  - Implement `downloadCSV(data)` utility converting criteria and values into standard RFC 4180 CSV with escaped quotes.
  - *Verification:* Verify clipboard contains valid Markdown table; verify downloaded CSV opens correctly in spreadsheet applications.

---

## Phase 4: Quality Day, Anti-Hallucination & Hardening (Day 4)
- [x] **Task 4.1: Critical Truth Rules & Zero-Hallucination Enforcement**
  - Embed zero-hallucination rules into System and User prompts:
    1. Every value must have direct textual evidence from `<PAGE_DATA>`.
    2. Absent, unconfirmed, or ambiguous specifications must output `"Not stated"` or `null`.
    3. Never use general pre-training knowledge to estimate numbers or defaults.
    4. Guessing considered corrupted.
  - *Verification:* Test with sparse snapshots; verify AI outputs `"Not stated"` rather than inventing specs.
- [x] **Task 4.2: Anti-Prompt-Injection Enclosure**
  - Encapsulate each page in `<PAGE_DATA id="..." url="..." domain="..." title="...">[UNTRUSTED WEBPAGE CONTENT START] ... [UNTRUSTED WEBPAGE CONTENT END]</PAGE_DATA>`.
  - Instruct LLM to ignore any instructions, prompts, or formatting directives within page text.
  - *Verification:* Test with prompt-injection strings inside page text; verify AI treats them strictly as passive data.
- [x] **Task 4.3: Dynamic Domain Criteria Extraction**
  - Verify model automatically adapts criteria based on domain:
    - Products: Price, Hardware Specs, Build Quality, Battery, Warranty.
    - Jobs: Compensation, Role Level, Remote Flexibility, Required Tech Stack.
    - SaaS: Pricing Tiers, Core Features, Integrations, SLA/Support.
    - Education: Tuition, Syllabus Depth, Format, Credential Type.
    - Articles: Thesis, Evidence, Tone, Author Credibility.
  - *Verification:* Run test cases across all 6 domains; verify 5–10 relevant criteria generated.
- [x] **Task 4.4: UI Hardening & Render Protection**
  - Guard `Results.tsx` against `null`, `undefined`, or `"NaN"` strings rendering directly; fallback to muted `"Not stated"`.
  - Calculate dynamic table min-width (`Math.max(700, items.length * 210 + 220)`) with `overflow-x-auto` for laptop displays (1366x768 to 1920x1080).
  - Detect Chrome internal URLs (`chrome://`, `edge://`) and show friendly warning with disabled button.
  - Detect duplicate tabs in workspace and alert user.
  - *Verification:* Build check (`npm run type-check`) with 0 errors; UI handles edge cases gracefully.

---

## Phase 5: Release Readiness, Store Assets & Documentation (Day 5)
- [x] **Task 5.1: Chrome Web Store Listing Metadata**
  - Create `store-assets/listing-metadata.md` containing Title, 132-character Summary, Full Description, and Single-Purpose statement conforming to Chrome Web Store policies.
  - Create 128x128 store icon (`store-assets/icon128.png`).
- [x] **Task 5.2: Public Documentation & Landing Page**
  - Create `docs/privacy-policy.html` detailing zero-tracking, local storage, and ephemeral processing.
  - Create `docs/support.html` with FAQs, troubleshooting steps, and contact links.
  - Create `docs/index.html` responsive landing page featuring hero banner, workflow diagram, and matrix preview.
- [x] **Task 5.3: Repository Documentation**
  - Create `README.md` following Section 42: Hero tagline, feature list, architecture diagram, local setup instructions, API schema reference, and MIT license.
- [x] **Task 5.4: Production Build & Extension Packaging**
  - Run production build in `extension/`.
  - Package production artifacts into `compare-anything-extension.zip` ready for upload.
  - *Verification:* Validate ZIP contains `manifest.json`, compiled JS bundles, HTML entries, and assets with no development artifacts.
