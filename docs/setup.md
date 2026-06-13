# Setup Guide — Smart Invoice & Receipt Processor

## Prerequisites

- n8n account (cloud: app.n8n.cloud, or self-hosted)
- Gmail account (the inbox that receives invoices)
- OpenAI API key (GPT-4o access)
- Google account with Sheets

---

## Step 1 — Import the Workflow

1. Open n8n → **Workflows** → **Add Workflow** → **Import from File**
2. Upload `workflow/invoice-processor.json`
3. The workflow opens with 10 nodes

---

## Step 2 — Connect Gmail Credential

1. Click the **Gmail Trigger** node
2. Under Credentials → Click **+ Create new**
3. Select **Gmail OAuth2**
4. Follow the OAuth flow to authorise your Google account
5. Save

---

## Step 3 — Set Your OpenAI API Key

Two options:

**Option A — Environment Variable (recommended for self-hosted)**
```bash
# In your n8n .env file or docker-compose.yml
N8N_OPENAI_API_KEY=sk-...your-key...
```
The workflow already references `$env.OPENAI_API_KEY`.

**Option B — n8n Credential**
1. Click **OpenAI — Extract Invoice Data** node
2. Switch Authentication to **Predefined Credential Type → OpenAI**
3. Create a new OpenAI credential and paste your key
4. Remove the manual header parameters from that node

---

## Step 4 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → New Spreadsheet
2. Rename the first sheet tab to **Invoices**
3. Add these column headers in Row 1 (exactly as shown):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Processed At | Vendor | Invoice Number | Date | Due Date | Amount | Currency | Tax | Payment Method | Line Items | Has Anomaly | Anomaly Details | Email Subject | Email From | Filename |

4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

---

## Step 5 — Connect Google Sheets

1. Click the **Log to Google Sheets** node
2. Credentials → Create new **Google Sheets OAuth2**
3. Authorise your Google account
4. In the **Document** field, paste your Spreadsheet ID
5. Sheet name: `Invoices`

---

## Step 6 — Set Alert Email

1. Click **Send Alert Email** node
2. Change the **Send To** field to your email address

---

## Step 7 — Connect Gmail for Sending Alerts

1. The **Send Alert Email** node uses the same Gmail OAuth2 credential
2. Select the credential you created in Step 2

---

## Step 8 — Activate

1. Click **Save**
2. Toggle **Active** to ON (top right)
3. Send yourself a test invoice PDF via email
4. Watch the execution log in n8n

---

## Testing Without a Real Invoice

1. Forward any billing email with a PDF attachment to your connected Gmail
2. Or create a simple PDF with vendor name, amount, date and email it to yourself
3. Check n8n **Executions** tab to see the run

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "No attachment found" | Make sure the email has a PDF attachment (not inline image) |
| Empty text extracted | Invoice may be a scanned image — use a text-based PDF for testing |
| OpenAI returns error | Check API key and that you have GPT-4o access |
| Sheets not logging | Verify the sheet tab is named exactly "Invoices" and column headers match |
| Alert not sent | Check the Send To email and Gmail credential |

---

## Customising Anomaly Thresholds

Edit the **Detect Anomalies** Code node to change:
- `HIGH_AMOUNT_THRESHOLD` — default is 10,000 (in invoice currency)
- Add your own vendor allowlist/denylist
- Change the overdue alert sensitivity
