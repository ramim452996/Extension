# Compare Anything: Stop switching between tabs. Compare them.

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-v1.0.0-blue?logo=googlechrome)](https://github.com/ramim452996/Extension)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-success?logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Groq AI](https://img.shields.io/badge/AI_Inference-Groq_Cloud-orange?logo=fastapi)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Compare Anything** is a Manifest V3 browser extension and high-speed backend API that lets you snapshot 2 to 4 open browser tabs, enter your personal priorities, and generate an instant, side-by-side comparative breakdown based **strictly on page text with zero AI hallucination**.

---

## 🎯 Table of Contents
1. [Core Features](#-core-features)
2. [Why Compare Anything?](#-why-compare-anything)
3. [Architecture & Zero-Hallucination Engine](#-architecture--zero-hallucination-engine)
4. [Repository Structure](#-repository-structure)
5. [Local Development Setup](#-local-development-setup)
   - [Backend Service (Laravel / PHP 8.2+)](#1-backend-service-laravel--php-82)
   - [Chrome Extension (React + Vite + TypeScript)](#2-chrome-extension-react--vite--typescript)
6. [Testing & Quality Verification](#-testing--quality-verification)
7. [Chrome Web Store Packaging](#-chrome-web-store-packaging)
8. [Privacy & Security Approach](#-privacy--security-approach)
9. [Documentation & Live Links](#-documentation--live-links)
10. [License](#-license)

---

## 🚀 Core Features

- **Side-by-Side Comparison Matrix:** Compare 2, 3, or 4 tabs across dynamically synthesized criteria (pricing, specifications, terms, features, pros, and cons).
- **Strict Zero-Hallucination Standard:** If a detail, warranty, or price is not explicitly printed in the extracted page snapshot, the system outputs `"Not stated"`. It never approximates or fabricates values.
- **Custom Priority Weighting:** Specify your primary constraints (e.g., *"Budget under $1,000"*, *"Must have free tier"*, *"Remote work only"*) to receive tailored winner verdicts and trade-off analyses.
- **Objective Winner Determination:** Highlights a justified `bestOverall` item with trade-off insights, or marks it `null` when items are tied or evidence is insufficient.
- **One-Click Export:** Download or copy your comparison matrix as structured **Markdown** or **CSV** for Notion, Google Sheets, or GitHub issues.
- **Lightweight & Fast:** Uses Groq Cloud inference to return complete structured comparisons in under 5 seconds.
- **Privacy-First:** Operates strictly on-demand. No background browsing tracking, no analytics telemetry, and zero user data retention.

---

## 💡 Why Compare Anything?

When researching purchases, evaluating software, or looking for jobs, users often juggle 10+ tabs, manually switching back and forth while trying to remember fine-print differences. 

Existing AI tools either:
1. Hallucinate missing features based on stale training data, or
2. Require users to manually copy-paste thousands of words into chat windows.

**Compare Anything** bridges this gap: with a single click, it extracts clean, visible DOM text from your selected tabs, passes it through a secure backend proxy, and renders an organized matrix directly in your browser.

---

## 🏗️ Architecture & Zero-Hallucination Engine

```
┌────────────────────────────────────────────────────────┐
│               Google Chrome (Manifest V3)              │
│                                                        │
│  [Tab 1]      [Tab 2]      [Tab 3]      [Tab 4]        │
│     │            │            │            │           │
│     └────────────┴──────┬─────┴────────────┘           │
│                         ▼                              │
│       Content Script: Clean DOM Text Extractor         │
│                         │                              │
│                         ▼                              │
│       React + TypeScript Extension Popup UI            │
└─────────────────────────┬──────────────────────────────┘
                          │ HTTPS / TLS (POST /api/compare)
                          ▼
┌────────────────────────────────────────────────────────┐
│                   Secure Backend API                   │
│                                                        │
│  - Untrusted data sanitization (<PAGE_DATA> blocks)    │
│  - Prompt injection protection                         │
│  - Strict JSON schema enforcement                      │
│  - Groq API Key isolation (never exposed to client)   │
└─────────────────────────┬──────────────────────────────┘
                          │ High-Throughput Inference
                          ▼
┌────────────────────────────────────────────────────────┐
│                      Groq Cloud                        │
│            (openai/gpt-oss-20b / compound-mini)        │
│          Zero-retention factual comparison             │
└────────────────────────────────────────────────────────┘
```

### The 4 Truth Rules Enforced by the Backend
1. **Direct Textual Evidence:** Every claim must have explicit grounding in the page text.
2. **"Not Stated" Guarantee:** Omitted specs receive `"Not stated"`—never an educated guess.
3. **No General Knowledge Contamination:** Pre-training assumptions about standard battery sizes, default warranties, or typical pricing are forbidden.
4. **Honest Refusal:** If pages lack sufficient data to declare a winner, `bestOverall.itemId` is set to `null` with a transparent explanation.

---

## 📁 Repository Structure

```
.
├── SPEC.md                      # Full product & architectural specification
├── README.md                    # Project documentation (this file)
├── .gitignore                   # Strict exclusion for .env, node_modules, dist, *.zip
├── docs/                        # Public pages & submission documentation
│   ├── index.html               # Responsive landing page (Section 43)
│   ├── implementation-plan.md   # Detailed execution plan (Section 47)
│   ├── privacy-policy.html      # Chrome Web Store compliant privacy policy
│   └── support.html             # User support & FAQ guide
├── store-assets/                # Chrome Web Store publishing package
│   ├── listing-metadata.md      # Title, 132-char summary, and store copy
│   └── icon128.png              # 128x128 extension icon
├── extension/                   # Manifest V3 Chrome Extension
│   ├── manifest.json            # MV3 manifest with minimal permissions
│   ├── package.json             # React, Vite, TypeScript dependencies
│   ├── vite.config.ts           # Extension multi-page build configuration
│   ├── tsconfig.json            # Strict TypeScript configuration
│   └── src/
│       ├── background/          # Background service worker
│       ├── content/             # DOM text & snapshot extractor
│       ├── popup/               # React popup UI (tabs, priorities, results)
│       ├── services/            # Backend API communication layer
│       ├── types/               # Strict comparison TypeScript types
│       └── utils/               # Markdown/CSV exporters & formatters
└── app/                         # Backend Service (Laravel API)
    ├── Http/Controllers/       # ComparisonController (POST /api/compare)
    └── Services/                # ComparisonService (Groq integration)
```

---

## 💻 Local Development Setup

### 1. Backend Service (Laravel / PHP 8.2+)

The backend securely stores the Groq API key and provides the `/api/compare` endpoint.

```bash
# 1. Clone the repository
git clone https://github.com/ramim452996/compare-backend.git
cd compare-backend

# 2. Install PHP dependencies
composer install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set your GROQ_API_KEY:
# GROQ_API_KEY=gsk_your_groq_api_key_here

# 4. Start the development server
php artisan serve --port=8000
# Backend will be available at: http://127.0.0.1:8000/api/compare
```

### 2. Chrome Extension (React + Vite + TypeScript)

```bash
# 1. Navigate to the extension directory
cd extension

# 2. Install Node dependencies
npm install

# 3. Build the extension bundle
npm run build
# Production artifacts will be compiled into extension/dist/
```

### 3. Load the Extension into Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Toggle on **"Developer mode"** in the top-right corner.
3. Click **"Load unpacked"**.
4. Select the `extension/dist` folder.
5. The **Compare Anything** icon will appear in your Chrome toolbar!

---

## 🧪 Testing & Quality Verification

### Run Extension Type Checks & Production Build
```bash
cd extension
npm run type-check   # Verifies TypeScript without compilation errors
npm run build        # Generates production bundle in dist/
```

### Test Backend Comparison Endpoint
```bash
curl -X POST http://127.0.0.1:8000/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "pages": [
      {
        "id": "item-1",
        "title": "MacBook Air M3",
        "url": "https://apple.com/macbook-air",
        "text": "MacBook Air with M3 chip. 8-core CPU, 10-core GPU. Up to 18 hours battery life. Liquid Retina display. Price: $1,099."
      },
      {
        "id": "item-2",
        "title": "Dell XPS 13",
        "url": "https://dell.com/xps-13",
        "text": "Dell XPS 13 Laptop. Intel Core Ultra 7 processor. 16GB LPDDR5x RAM. Up to 14 hours battery life. Price: $1,299."
      }
    ],
    "userPriority": "Best battery life and lowest price"
  }'
```

---

## 📦 Chrome Web Store Packaging

To create a clean, store-ready ZIP archive:

```bash
# From the repository root:
php -r '$zip = new ZipArchive(); $zip->open("store-assets/compare-anything-extension.zip", ZipArchive::CREATE | ZipArchive::OVERWRITE); $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("extension/dist")); foreach ($files as $file) { if (!$file->isDir()) { $filePath = $file->getRealPath(); $relPath = substr($filePath, strlen(realpath("extension/dist")) + 1); $zip->addFile($filePath, str_replace("\\", "/", $relPath)); } } $zip->close();'
```

---

## 🛡️ Privacy & Security Approach

Compare Anything adheres strictly to Google Chrome's **Single Purpose** and **Minimal Privilege** policies:

- **Minimal Permissions:** Only `activeTab`, `scripting`, and `storage` are requested.
- **On-Demand Execution:** Content scripts are injected only when the user explicitly clicks "Add Current Tab".
- **Zero Credentials in Client:** No Groq API keys are bundled into the extension.
- **No Browsing History:** The extension does not record, log, or transmit URLs outside of explicitly added tabs.
- **Zero Model Training:** Data passed through Groq APIs is never retained or used to train public models.

---

## 🌐 Documentation & Live Links

- **Landing Page:** [`docs/index.html`](docs/index.html)
- **Privacy Policy:** [`docs/privacy-policy.html`](docs/privacy-policy.html)
- **Support & FAQ:** [`docs/support.html`](docs/support.html)
- **Chrome Web Store Metadata:** [`store-assets/listing-metadata.md`](store-assets/listing-metadata.md)
- **Specification Document:** [`SPEC.md`](SPEC.md)
- **Implementation Plan:** [`docs/implementation-plan.md`](docs/implementation-plan.md)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
