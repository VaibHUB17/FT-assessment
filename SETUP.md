# Setup & Verification Guide: FreightWatch AI

Follow these exact steps to run the Dual-Engine pipeline, verify reproducibility, run the LlamaIndex Workflows engine, and launch the web dashboard.

---

## Prerequisites & Environment Keys

- **Python 3.10+** (Virtual environment configured in `.venv`)
- **Node.js 18+** & **npm** (For Next.js dashboard)
- **API Keys** (Already pre-configured in `.env` and `web/.env.local`):
  - `GROQ_API_KEY`: Powers live high-speed LLM reasoning with `openai/gpt-oss-120b` (Groq LPU).
  - `GEMINI_API_KEY`: Powers 3072-dimensional dense vector embeddings with `gemini-embedding-001`.
  - *Offline Resilience*: If API keys are absent, the system automatically falls back to local Scikit-Learn TF-IDF vector embeddings and cached reasoning with 0 crashes.

---

## 1. Engine 1: Master Analytics, RAG & Evaluation Pipeline

Run the master pipeline script from the project root (zero external dependencies required):

```bash
# Windows PowerShell / Command Prompt / Linux / macOS
python pipeline/run_all.py
```

This single command will:
1. Ingest `AI Intern Case Study/shipment_records.csv` (2,940 records).
2. Calculate weekly weighted tonne-km costs across 104 weeks (728 route-weeks).
3. Compute 8-week trailing rolling averages and peer group baselines.
4. Flag all 20 anomaly events ($\ge +20\%$ threshold).
5. Ingest `AI Intern Case Study/context_notes.csv` via RAG retrieval with hallucination guardrails.
6. Generate `output.csv` matching the required format (0 diffs against benchmark).
7. Execute 3 consecutive untouched runs to prove 100% deterministic reproducibility.
8. Run the negative-control guardrail test suite (5 / 5 passed).
9. Calculate Ragas-style quantitative evaluation metrics (Faithfulness 92.5%, Precision 100%, Relevancy 100%).
10. Output the complete Token & Cost accounting report ($0.001098 USD).
11. Export UI data fixtures to `web/src/data/freight_data.json`.

---

## 2. Engine 2: LlamaIndex Workflows & Semantic CLI

Run the event-driven LlamaIndex Workflows and LanceDB engine for ad-hoc semantic questions:

```bash
# Ask any natural language question about corridor disruptions
python pipeline/llamaindex_rag.py --query "Why was Chennai-Bangalore pricier in March 2025?"
python pipeline/llamaindex_rag.py --query "Did diesel price increases cause routes to spike?"
```

To run the workflow test bench:
```bash
python pipeline/llamaindex_rag.py
```

---

## 3. Dedicated Quantitative Evaluation Suite

To run only the reproducibility and quantitative RAG evaluation suite:

```bash
python pipeline/reproducibility_eval.py
```

Outputs:
- **3-Pass SHA-256 Hashes:** Identical across all runs (`5fe61d8700...`).
- **5/5 Distractor Refusals:** Confirms N005, N006, N008, N009, N010 are rejected.
- **Ragas Quality Metrics:** Faithfulness, Context Precision, Answer Relevancy, Composite Score.

---

## 4. Launch the Next.js 16 Web Dashboard

Navigate to the `web` folder and start the local development server:

```bash
cd web
npm run dev
```

Open your browser at:
**[http://localhost:3000](http://localhost:3000)**

### Dashboard Features:
- **Corridor Trends Tab**: Interactive SVG chart plotting weekly unit costs against rolling baselines and peer corridors.
- **Anomaly Audit Tab**: Filterable, searchable table matching `sample_output_format.csv`.
- **Slide-over Drawer**: Click any row or chart point to inspect raw volume, RAG retrieved note citations, and guardrail decision steps.
- **AI Freight Assistant Tab**: Interactive conversational Q&A grounded in freight data and notes.
- **Reproducibility & Eval Tab**: Side-by-side verification of Run 1 vs Run 2 vs Run 3 hashes, test-suite passes, and token ledger.
- **Export CSV Button**: Instantly download `output.csv`.
