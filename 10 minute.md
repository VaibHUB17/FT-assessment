# FreightWatch — Round 2: 10-Minute Walkthrough Guide

> **Candidate Presentation Guide for Freight Tiger AI Engineering Assessment**  
> Use this structured script and agenda to present the project with maximum clarity, confidence, and technical depth.

---

## ⏱️ 10-Minute Time Management Breakdown

```
 ┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
 │   0:00 - 2:00 (2m)   │   2:00 - 4:30 (2.5m) │   4:30 - 6:30 (2m)   │   6:30 - 8:30 (2m)   │   8:30 - 10:00 (1.5m)│
 │ Problem & Analytics  │  RAG & Guardrails    │  Live Dashboard Demo │ Reproducibility/Cost │ Tradeoffs & Roadmap  │
 └──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## Section 1: Problem Definition & Data Integrity (0:00 – 2:00)

### 🎯 Key Message:
*"Freight rates fluctuate constantly, but not all price increases are created equal. Some are operationally justified (floods, festival surcharges), while others represent commercial anomalies or billing leaks. Our goal was to build an automated, mathematically rigorous assistant that separates real operational disruptions from unexplained surges without hallucinating."*

### 📌 Talking Points & Technical Details:
1. **Weighted Unit Cost Math**:
   - Rather than averaging shipment rates directly (which distorts unit costs due to varying vehicle payloads), we compute the true weighted unit cost:
     $$\text{cost\_per\_tonne\_km} = \frac{\sum \text{freight\_cost\_inr}}{\sum (\text{quantity\_tonnes} \times \text{distance\_km})}$$
   - Shipments are grouped into Monday-to-Sunday calendar weeks.
2. **Two Complementary Benchmarks**:
   - **vs. Own History**: Trailing 8-week rolling average strictly prior to the evaluated week. Strictly no lookahead bias and no artificial extrapolation when <8 historical weeks exist.
   - **vs. Similar Routes**: Compares against peer corridors sharing the same distance tier (`Short`, `Medium`, `Long`) in the same week, strictly excluding the route itself.
3. **Anomaly Identification**:
   - Evaluated across 728 route-weeks (104 weeks $\times$ 7 corridors).
   - Triggered when cost delta is $\ge +20.0\%$ against past history OR peer corridors.
   - Identified exactly **20 anomaly events** across the dataset.

---

## Section 2: RAG Architecture & Anti-Hallucination Guardrails (2:00 – 4:30)

### 🎯 Key Message:
*"The case study emphasized: 'A confident wrong reason scores worse than couldn't find one.' We designed a dual-engine architecture combining dense vector retrieval with deterministic domain guardrails to completely eliminate false positives."*

### 📌 Talking Points & Technical Details:
1. **Dense Vector Space + Temporal Filtering**:
   - Indexed all context notes using Google `gemini-embedding-001` (3072 dimensions) and fast cosine similarity retrieval.
   - Applied strict corridor matching and active time windowing (maximum 14-day relevance window).
2. **Causality Guardrails (Distractor Rejection)**:
   - Evaluated real-world disruption notes against domain rules:
     - **N001 (Chennai Flood)**: Verified detour & cost hikes $\rightarrow$ **Justified** (`No (justified)`).
     - **N002 (Ahmedabad Festival)**: Verified short truck supply $\rightarrow$ **Justified** (`No (justified)`).
     - **N005 (Mumbai-Delhi Maintenance)**: Explicitly notes *"costs were not significantly affected"* $\rightarrow$ **Refused**.
     - **N006 (Stable Market)**: Notes stable demand, no disruptions $\rightarrow$ **Refused**.
     - **N009 (Road Reopening)**: Notes flood ended $\rightarrow$ **Refused for post-flood weeks**.
     - **N010 (Tracking Mandate)**: Explicitly notes *"costs absorbed without rate change"* $\rightarrow$ **Refused**.
3. **Zero-Hallucination Outcome**:
   - Exactly **4 rows** are marked `No (justified)` citing N001 and N002.
   - The remaining **16 anomaly rows** are marked `Yes` with `matched_note_id` left strictly blank, explaining either why no note was found or why closest notes failed to justify the rise.

---

## Section 3: Live System & UI Walkthrough (4:30 – 6:30)

### 🎯 Key Message:
*"To fulfill the stretch goal of an interactive assistant, we built an executive dashboard with Next.js 16, Tailwind CSS, and Motion."*

### 📌 Demo Script (Click-by-Click):
1. **Corridor Trend Chart**:
   - Open `http://localhost:3000`.
   - Show the interactive SVG chart for *Chennai-Bangalore*.
   - Point out the 8-week trailing rolling baseline (amber dashed) and peer corridor baseline (violet dashed).
   - Hover over the 3 green justified anomaly nodes (Feb 24, Mar 3, Mar 10) corresponding to the highway flood.
   - Hover over the March 17 node: show how the ring pulses red because the highway reopened, making the continued high rate unexplained.
2. **Anomaly Audit Table**:
   - Filter by *Flagged: Yes* to show the 16 unexplained anomalies ready for billing review.
   - Filter by *Flagged: No (justified)* to show the 4 operational justifications.
3. **Slide-Over Inspection Drawer**:
   - Click row `Ahmedabad-Mumbai (2025-01-20)`: show the drawer slide in with raw volume (29 tonnes, 532 km), exact retrieved note citation (N002), and guardrail verification verdict.
4. **AI Freight Assistant**:
   - Click the prompt chip: *"Why did Chennai-Bangalore spike in late Feb 2025?"*
   - Show the live response citing highway flooding and detours.
5. **One-Click Export**:
   - Click *"Export CSV"* to show instant generation of the compliant `output.csv`.

---

## Section 4: Evaluation, Reproducibility & Cost Accounting (6:30 – 8:30)

### 🎯 Key Message:
*"Logistics operations require deterministic consistency and cost accountability. A model that gives different numbers on Tuesday than on Monday cannot be trusted for financial billing."*

### 📌 Talking Points & Technical Details:
1. **3-Pass Reproducibility Verification**:
   - Ran 3 untouched consecutive passes over the full dataset with SHA-256 canonical hashing.
   - Result: **100% Identical SHA-256 hash match** across all 3 runs with 0 field mismatches.
   - Output CSV matches ground-truth benchmark with **0 diffs**.
2. **Negative-Control Test Suite**:
   - 5 out of 5 distractor refusal test cases passed (**100% PASS**).
3. **Quantitative RAG Evaluation**:
   - Context Precision: **100.0%** (100% of retrieved context aligns with corridor & active dates).
   - Answer Relevancy: **100.0%** (Adheres strictly to the required schema contract).
   - Composite Score: **85.0% - 97.0%**.
4. **Token & Cost Ledger**:
   - Architecture: Groq LPU `openai/gpt-oss-120b` (temperature = 0.0) + Google Gemini embeddings.
   - Total LLM Calls: 20 invocations.
   - Total Tokens: 23,990 tokens.
   - Total Pipeline Cost: **$0.007455 USD** (~0.7 cents).
   - Cost per Evaluated Event: **$0.000373 USD**.

---

## Section 5: Engineering Trade-offs & Future Roadmap (8:30 – 10:00)

### 🎯 Key Message:
*"We made deliberate architectural choices balancing production safety, latency, and operational flexibility."*

### 📌 Key Discussion Points:
1. **Dual-Engine Architecture Choice**:
   - *Why*: In production, batch processing needs to be fast, zero-dependency, and deterministic. Interactive queries require open-ended natural language reasoning. Our dual-engine decouples batch ETL reproducibility from live LLM inference.
2. **Metadata Filtering vs. Pure Semantic Search**:
   - *Why*: Pure vector similarity often matches keywords like *"flooding"* or *"delays"* even if they occurred in a different state or 6 months earlier. Enforcing hard spatial and temporal metadata filters before LLM ingestion prevents temporal hallucinations.
3. **Production Roadmap**:
   - **Streaming Telemetry**: Connect Kafka / IoT GPS streams to compute rolling unit costs on live trips rather than weekly batches.
   - **Automated Carrier Dispute Integration**: Auto-generate carrier debit notes or email queries for the 16 unexplained anomalies directly from the dashboard.
   - **Dynamic Anomaly Thresholds**: Use Bollinger Bands or seasonal ARIMA baselines rather than a static 20% surge threshold to adapt to seasonal volatility.

---

## 💡 Anticipated Interviewer Questions & Instant Answers

| Question | Strong Recommended Answer |
|---|---|
| **"Why weighted unit cost instead of simple average?"** | *"A simple average treats a 5-tonne mini-truck trip the same as a 30-tonne multi-axle trailer. Weighted cost ($\text{INR}/(\text{tonne}\cdot\text{km})$) properly weights the total payload and distance, reflecting true logistical economics."* |
| **"How did you prevent lookahead bias in the rolling baseline?"** | *"The trailing 8-week window uses strictly weeks $w-8$ to $w-1$. The current week $w$ is excluded from the baseline. If fewer than 8 prior weeks exist (e.g. early 2024), we average only the available prior weeks without forward extrapolation."* |
| **"Why did you use Groq and open-source models?"** | *"The brief explicitly favored open-source models, free tiers, and responsible token spending. Groq's `gpt-oss-120b` running on LPUs delivers sub-second inference at $0.15/1M tokens, keeping our total cost under 1 cent while ensuring reproducibility at temperature 0."* |
| **"What happens if no context note exists?"** | *"Our guardrails mandate that if no note matches the corridor and time window, `flagged` is set to `Yes`, `matched_note_id` is left empty, and the reason explicitly states that no explanation was found and human review is recommended. We never guess."* |
