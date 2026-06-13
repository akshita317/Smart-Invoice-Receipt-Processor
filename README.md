# Smart Invoice & Receipt Processor

An AI-powered automation that watches your inbox, extracts structured data from invoice PDFs using GPT-4o, logs everything to Google Sheets, and fires alerts when anomalies are detected — fully orchestrated with n8n.

Built by **Akshita Kumari** · [LinkedIn](https://www.linkedin.com/in/akshitakumari317/) · [GitHub](https://github.com/akshita317)

---

## What It Does

```
Gmail (new email with PDF)
        │
        ▼
  Has attachment? ──No──► Stop
        │ Yes
        ▼
  Extract PDF text
  (n8n Code node)
        │
        ▼
  GPT-4o: Extract structured data
  { vendor, amount, date, invoice_no, line_items }
        │
        ▼
  Parse + Validate JSON
        │
        ├──► Google Sheets — Append row
        │
        ▼
  Anomaly Detection
  (duplicate amount · missing fields · future date · zero amount)
        │
        ├── Anomaly found ──► Alert Email (Gmail)
        └── Clean ──────────► Done
```

---

## Tech Stack

| Layer | Tool |
|---|---|
| Automation | n8n (self-hosted or cloud) |
| Email trigger | Gmail OAuth2 |
| AI extraction | OpenAI GPT-4o (Chat Completions) |
| Storage | Google Sheets |
| Alerts | Gmail Send |
| Language | Node.js (n8n Code nodes) |

---

## Folder Structure

```
Smart-Invoice-Receipt-Processor/
├── workflow/
│   └── invoice-processor.json     ← Import this into n8n
├── src/
│   ├── 1_extract_pdf.js           ← Code node: PDF → text
│   ├── 2_build_prompt.js          ← Code node: build OpenAI payload
│   ├── 3_parse_invoice.js         ← Code node: parse LLM response
│   └── 4_anomaly_detector.js      ← Code node: detect anomalies
├── prompts/
│   └── invoice_extraction.txt     ← System prompt for GPT-4o
├── sample/
│   └── output_example.json        ← What a processed invoice looks like
├── docs/
│   ├── setup.md                   ← Step-by-step setup guide
│   └── google-sheets-schema.md    ← Sheet column layout
├── .env.example                   ← Required credentials
└── README.md
```

---

## Quick Setup

1. **Import workflow** → In n8n, go to Workflows → Import → upload `workflow/invoice-processor.json`
2. **Set credentials** → Gmail OAuth2, OpenAI API key, Google Sheets OAuth2
3. **Create your sheet** → Use the schema in `docs/google-sheets-schema.md`
4. **Set your Sheet ID** → Update the Google Sheets node with your spreadsheet ID
5. **Activate** → Toggle the workflow on

Full guide: [docs/setup.md](docs/setup.md)

---

## Sample Output

**Input:** PDF invoice email from `billing@aws.amazon.com`

**Extracted:**
```json
{
  "vendor": "Amazon Web Services",
  "invoice_number": "INV-2025-0042",
  "date": "2025-11-15",
  "amount": 847.32,
  "currency": "USD",
  "line_items": [
    { "description": "EC2 Compute (t3.medium)", "amount": 412.10 },
    { "description": "S3 Storage", "amount": 89.22 },
    { "description": "RDS PostgreSQL", "amount": 346.00 }
  ],
  "has_anomaly": false
}
```

**Logged to Google Sheets** ✓  
**No alert sent** (clean invoice)

---

## Anomaly Rules

| Rule | Trigger |
|---|---|
| High amount | Total > $10,000 |
| Zero / negative | Amount ≤ 0 |
| Missing vendor | Vendor field empty |
| Missing invoice number | Could not extract |
| Future date | Invoice date after today |
| Duplicate detection | Same vendor + amount seen in last 30 days |

---

## Google Sheets Schema

| Column | Value |
|---|---|
| A | Processed At (timestamp) |
| B | Vendor |
| C | Invoice Number |
| D | Date |
| E | Amount |
| F | Currency |
| G | Line Items (JSON string) |
| H | Has Anomaly |
| I | Anomaly Details |
| J | Email Subject |

---

## License

MIT — free to use, fork, and adapt.
