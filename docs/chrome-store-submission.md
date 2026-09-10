# Chrome Web Store Submission Checklist & Listing Metadata

**Target Application:** Compare Anything  
**Release Version:** 1.0.0  
**Package Artifact:** `store-assets/compare-anything-v1.0.0.zip`  
**License:** MIT  

---

## 1. Extension Identity & Metadata

| Field | Submission Value | Guidelines Check |
| :--- | :--- | :--- |
| **Title** | `Compare Anything – AI Web Comparison` | Exact SPEC match, 39 chars (under 45 char limit). No keyword stuffing. |
| **Short Summary** | `Add 2–4 web pages and get one clear AI comparison table based only on the information on those pages.` | 101 characters (strict limit: 132 chars max). |
| **Primary Category** | `Productivity` | Selected in Developer Dashboard dropdown. |
| **Language** | `English (United States)` | Default extension locale. |
| **Pricing / Payments** | `Free` | No in-app purchases or subscriptions. |

---

## 2. Single-Purpose Policy Statement

> **Single-Purpose Description:**  
> `"Compare Anything allows users to select webpages and generate an AI-assisted side-by-side comparison of the information contained on those selected pages."`

### Justification for Permissions
- **`activeTab` & `scripting`:** Used strictly when the user clicks the extension action or "+ Add Page" to extract readable text from the explicitly chosen browser tab. The extension does not monitor browsing history or inspect unselected tabs.
- **`storage`:** Used purely within `chrome.storage.local` to store added comparison pages, comparison history, and custom criteria on the user's device. No user data is persisted remotely.

---

## 3. Store Description (SPEC Section 38)

```markdown
Stop switching between tabs. Compare them.

Compare Anything allows you to add 2 to 4 web pages and get one clear, objective AI comparison table based strictly on the information visible on those pages.

Whether you are comparing products, SaaS subscription plans, job postings, course curricula, or software libraries, Compare Anything eliminates manual note-taking and messy spreadsheets.

KEY FEATURES:
• Side-by-Side Comparison Matrix: Dynamically detects relevant criteria (pricing, specs, terms, features, pros and cons) and lays them out in a structured grid.
• Zero Hallucination Guarantee: Grounded strictly in page facts. If a price, policy, or feature is missing from the source page, it is labeled "Not stated"—the AI never invents information.
• Best Overall & Tailored Verdicts: Clearly highlights the winning choice and explains trade-offs (e.g., "Best for Budget", "Best for Power Users") based on what matters to you.
• Custom Priority Input: Add your own constraints (e.g., "Battery life under $1,000" or "Remote friendly") to tailor the recommendation.
• Instant Export: Copy as clean GitHub/Notion-ready Markdown or download as an RFC-4180 compliant CSV file for Google Sheets and Excel.
• Privacy First: Minimal permissions. No background tab monitoring, no browsing history tracking, and zero advertising or tracking scripts.

HOW IT WORKS:
1. Add a page: Click "+ Add Page" to snapshot visible text from your active tab.
2. Add another: Switch to competitor or alternative tabs and add them (up to 4 pages).
3. Compare: Click "Compare" to view your side-by-side decision matrix.

PRIVACY & PERMISSIONS:
Compare Anything requires activeTab and scripting solely to extract visible text from the specific pages you choose to add. Your data is processed ephemerally and never sold or used for model training.
```

---

## 4. Visual Asset Specifications Checklist

All graphics must be strictly formatted according to Chrome Web Store Developer Program specifications:

- [ ] **Extension Icon**
  - **Resolution:** `128x128 px`
  - **Format:** PNG (32-bit with transparency)
  - **Source Path:** `store-assets/icon-128.png` / `extension/public/icons/icon-128.png`
  - **Requirement:** Centered glyph with modern contrast, clean edges on both dark and light store themes.

- [ ] **Small Promo Tile**
  - **Resolution:** `440x280 px`
  - **Format:** PNG
  - **Source Path:** `store-assets/promo-small-440x280.png`
  - **Content:** Minimalist card with app logo, badge, and headline: *"Stop switching tabs. Compare them."*

- [ ] **Store Screenshots (Resolution: 1280x800 px PNG / JPEG)**

  - [ ] **Screenshot 1:**  
    **Caption:** *"Add pages you want to compare"*  
    **Visual:** Browser window showing 2–3 tabs open with the Compare Anything popup open, showing added tabs and the active "+ Add Page" action.

  - [ ] **Screenshot 2:**  
    **Caption:** *"One clear comparison"*  
    **Visual:** Full comparison matrix table showing structured side-by-side criteria rows (Pricing, Features, Limits, Support) with winner cell highlights.

  - [ ] **Screenshot 3:**  
    **Caption:** *"Compare based on what matters to you"*  
    **Visual:** Criteria / user priority badge active (e.g., "Goal: Best battery life under $1,200") highlighting the "Best Overall" card and rationale.

  - [ ] **Screenshot 4:**  
    **Caption:** *"Make decisions faster"*  
    **Visual:** Summary of key differences, trade-offs breakdown, and one-click "Copy Markdown" / "Download CSV" export buttons.

  - [ ] **Screenshot 5:**  
    **Caption:** *"Compare more than products"*  
    **Visual:** Real-world comparison showing SaaS pricing plans, job offer perks, or framework specifications showing "Not stated" handling.

---

## 5. Web Store Privacy Practices & Disclosures

When completing the **Privacy** tab in the Chrome Developer Dashboard:

1. **Single Purpose:**
   Select: *Yes, I certify that my extension complies with the single purpose policy.*
2. **Permission Justifications:**
   - `activeTab`: "To read visible content from the web page currently open in the active tab when the user initiates a comparison."
   - `scripting`: "To execute a lightweight content extraction script on the active tab upon user action."
   - `storage`: "To save comparison workspace state and locally cached results in chrome.storage.local."
3. **Data Usage:**
   - Mark **"User Activity"** as **Not Collected**.
   - Mark **"Website Content"** as **Collected** (with purpose: *App functionality*).
   - Check: *"Data is not sold to third parties"*
   - Check: *"Data is not used or transferred for purposes unrelated to the item's core functionality"*
   - Check: *"Data is not used or transferred to determine creditworthiness or for lending purposes"*
4. **Privacy Policy Link:**  
   `https://ramim452996.github.io/Extension/privacy-policy.html`
5. **Support Link:**  
   `https://ramim452996.github.io/Extension/support.html`

---

## 6. Pre-Submission Package Verification

- [x] Production zip created: `store-assets/compare-anything-v1.0.0.zip`
- [x] Manifest version verified: `Manifest V3`
- [x] Developer mode console errors verified: 0 errors
- [x] Source maps detached / disabled: `vite.config.ts` has `sourcemap: false`
- [x] No API keys or secret credentials in client bundle
- [x] Local storage isolation verified (`chrome.storage.local` only)
