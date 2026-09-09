# Compare Anything – AI Web Comparison (Specification)

## 1. Executive Summary
- **Product Name:** Compare Anything – AI Web Comparison
- **Tagline:** Stop switching between tabs. Compare them.
- **Core Purpose:** Enable users to capture 2–4 webpages from their browser, optionally define their comparison goal or priorities, and receive an instant, objective, side-by-side comparison matrix generated strictly from actual page content with zero hallucination.
- **Release Target:** Day 5 Production Release (Chrome Web Store & Self-Hosted API).

---

## 2. Technology Stack & System Architecture

### 2.1 Chrome Extension (Client)
- **Platform:** Google Chrome / Chromium Browsers (Manifest V3 compliant).
- **Core Frameworks:** React 18, TypeScript 5, Vite 5, TailwindCSS 3.
- **Permissions Required:**
  - `activeTab`: Access current tab URL, title, and run DOM extractor on explicit user action.
  - `scripting`: Programmatic injection of page content extraction script.
  - `storage`: Local persistence (`chrome.storage.local`) of captured tabs and comparison history.
- **Security:**
  - No remote code execution; 100% compliant with CSP for Manifest V3.
  - No secrets or AI API keys bundled in client code.

### 2.2 Backend Service (API)
- **Framework:** Laravel 11 / PHP 8.3 (High-performance API engine).
- **AI Provider:** Groq AI Cloud Engine (`groq/compound-mini` / `openai/gpt-oss-20b` fallback).
- **Endpoint:** `POST /api/v1/compare` (aliased to `POST /api/compare`).
- **Middleware & Guards:**
  - CORS with permissive origin support for Chrome Extension IDs.
  - Strict input validation (min 2, max 4 pages; max 4,000 chars per page; required valid URLs).
  - Duplicate URL rejection (HTTP 422).
  - Rate Limiting: 10 comparisons per 24 hours per `installId`; 30 comparisons per hour per IP.

---

## 3. Core Capabilities & User Flow

```
[ Active Webpage ]
       │
       ▼ (User clicks "+ Add to Comparison")
[ Content Extractor (DOM / text) ]
       │
       ▼ (Stored in chrome.storage.local)
[ Extension Popup Workspace (2-4 pages) ]
       │
       ▼ (User enters optional goal, clicks "⚡ Compare")
[ Backend API (/api/v1/compare) ]
       │
       ▼ (Untrusted XML <PAGE_DATA> Encapsulation)
[ Groq AI Provider (Zero-Hallucination Engine) ]
       │
       ▼ (Validated Structured JSON)
[ Full-Page Comparison Matrix View (results.html) ]
       │
       ├── Interactive Matrix Table (2, 3, or 4 columns)
       ├── Quick Verdict (Best Overall / Tied)
       ├── Best For Specific Needs Cards
       ├── Key Differences & Missing Information
       └── Export Actions (Copy as Markdown, Download CSV)
```

---

## 4. Zero-Hallucination Policy & Critical Truth Rules

The comparison engine operates under four immutable rules:
1. **Direct Evidence Only:** Every single value, metric, and specification must have direct textual evidence from the provided `<PAGE_DATA>` blocks.
2. **Strict Fallbacks:** If a specification is absent, unconfirmed, or ambiguous, the AI must output `"Not stated"` (for text fields) or `null` (for numeric/boolean fields).
3. **No Pre-Training Knowledge:** Never rely on general world knowledge to supply typical battery life, standard dimensions, default warranty terms, or estimated prices.
4. **Corrupted Output Guarantee:** Any guessing, extrapolation, or speculation invalidates the comparison.

---

## 5. Security & Anti-Prompt-Injection

All webpage text is treated as untrusted user input:
- Each page is encapsulated in `<PAGE_DATA id="..." url="..." domain="..." title="...">[UNTRUSTED WEBPAGE CONTENT START] ... [UNTRUSTED WEBPAGE CONTENT END]</PAGE_DATA>`.
- The system prompt explicitly instructs the LLM to disregard any instruction, command, system override, or roleplay prompt embedded inside webpage text.
- HTML and Markdown delimiters are stripped and sanitized during rendering.

---

## 6. Output Schema Specification

The backend and AI output strictly adhere to the following JSON schema:
```json
{
  "comparisonTitle": "string",
  "comparisonType": "string",
  "goal": "string or null",
  "items": [
    {
      "id": "EXACT id from PAGE_DATA",
      "displayName": "string",
      "shortDescription": "string"
    }
  ],
  "criteria": [
    {
      "name": "string",
      "importance": "high|medium|low",
      "values": [
        {
          "itemId": "EXACT id from PAGE_DATA",
          "value": "string",
          "confidence": "high|medium|low"
        }
      ],
      "winnerItemIds": ["EXACT ids from PAGE_DATA"]
    }
  ],
  "bestOverall": {
    "itemId": "EXACT id from PAGE_DATA or null",
    "reason": "string"
  },
  "bestFor": [
    {
      "label": "string",
      "itemId": "EXACT id from PAGE_DATA",
      "reason": "string"
    }
  ],
  "keyDifferences": ["string"],
  "missingInformation": [
    {
      "itemId": "EXACT id from PAGE_DATA",
      "fields": ["string"]
    }
  ]
}
```

---

## 7. Day 5 Checklist & Definition of Done

- [x] **Production Build:** Vite production bundle (`dist/`) builds cleanly with zero TypeScript errors.
- [x] **Backend API:** `POST /api/v1/compare` and `POST /api/compare` active, rate-limited, and tested.
- [x] **Privacy Policy:** `docs/privacy-policy.html` published, compliant with Chrome Web Store standards.
- [x] **Support Documentation:** `docs/support.html` with FAQs and troubleshooting guidelines.
- [x] **Landing Page:** `docs/index.html` responsive landing page featuring hero, workflow, and matrix demo.
- [x] **Repository Documentation:** Comprehensive `README.md` following Section 42.
- [x] **Store Listing Assets:** `store-assets/listing-metadata.md` (metadata, descriptions, single-purpose statement) and `store-assets/icon128.png`.
- [x] **Distribution Packaging:** Extension packaged as `.zip` archive ready for Developer Dashboard upload.
