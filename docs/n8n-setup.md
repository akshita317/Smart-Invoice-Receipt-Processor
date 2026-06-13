# n8n Setup Guide — Run Locally for Free

n8n is open-source. Self-hosted = free forever.
n8n Cloud = free 14-day trial only, then paid.

We'll run it locally on your machine — completely free.

---

## Step 1 — Start n8n (one command, Node.js already installed)

Open **PowerShell** or **Terminal** and run:

```powershell
npx n8n
```

First run downloads n8n (~2 minutes). You'll see:

```
Editor is now accessible via: http://localhost:5678
```

Open that URL in your browser.

> To run it again later: just `npx n8n` again in any terminal.
> To stop it: press Ctrl+C in the terminal.

---

## Step 2 — Create Your Local Account

1. Browser opens at `http://localhost:5678`
2. Click **Get started**
3. Enter any email + password (stored locally, not sent anywhere)
4. You're in — this is your n8n dashboard

---

## Step 3 — Import the Workflow

1. In n8n, click **Workflows** in the left sidebar
2. Click **+ Add Workflow**
3. Click the **⋮** menu (top right) → **Import from File**
4. Select `workflow/invoice-processor.json` from this project
5. The workflow loads with all 10 nodes visible
6. Click **Save**

---

## Step 4 — Set Up Gmail OAuth2

Gmail needs an OAuth2 app registered in Google Cloud.
This takes ~5 minutes and is free.

### 4a — Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click the project dropdown (top left) → **New Project**
3. Name it `n8n-invoice-processor` → **Create**
4. Make sure the new project is selected

### 4b — Enable Gmail API

1. Go to **APIs & Services** → **Library**
2. Search for **Gmail API** → Click it → **Enable**
3. Also enable **Google Sheets API** (same steps)

### 4c — Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. If prompted, click **Configure Consent Screen** first:
   - User Type: **External** → Create
   - App name: `n8n Invoice Processor`
   - Support email: your Gmail
   - Developer email: your Gmail
   - Click **Save and Continue** through all steps
   - Click **Back to Dashboard**
4. Now go to **Credentials** → **+ Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Name: `n8n local`
7. Under **Authorised redirect URIs** → **+ Add URI**:
   ```
   http://localhost:5678/rest/oauth2-credential/callback
   ```
8. Click **Create**
9. A popup shows your **Client ID** and **Client Secret** — copy both

### 4d — Add Gmail Credential in n8n

1. In n8n, go to **Settings** (bottom left gear icon) → **Credentials**
2. Click **+ Add Credential** → search for **Gmail OAuth2**
3. Paste your **Client ID** and **Client Secret**
4. Click **Sign in with Google** → allow all permissions
5. Save as `Gmail OAuth2`

---

## Step 5 — Set Up Google Sheets OAuth2

Uses the same Google Cloud project and OAuth2 credential.

1. In n8n **Credentials** → **+ Add Credential** → **Google Sheets OAuth2 API**
2. Paste the same **Client ID** and **Client Secret**
3. Click **Sign in with Google** → allow permissions
4. Save as `Google Sheets OAuth2`

---

## Step 6 — Create Your Google Sheet

1. Go to https://sheets.google.com → **Blank spreadsheet**
2. Rename the sheet tab at the bottom to: **Invoices**
3. In Row 1, add these headers exactly (one per column):

```
Processed At | Vendor | Invoice Number | Date | Due Date | Amount | Currency | Tax | Payment Method | Line Items | Has Anomaly | Anomaly Details | Email Subject | Email From | Filename
```

4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/  ← THIS PART →  /edit
   ```

---

## Step 7 — Set Your Gemini API Key in n8n

1. In n8n, go to **Settings** → **Environment Variables**
   (or edit `~/.n8n/.env` file directly)
2. Add:
   ```
   GEMINI_API_KEY=AIza...your-key...
   ```
3. Restart n8n (Ctrl+C in terminal → run `npx n8n` again)

> Get your free Gemini key at https://aistudio.google.com/app/apikey — no credit card needed.

---

## Step 8 — Connect Credentials to Workflow Nodes

1. Open your imported workflow
2. Click the **Gmail Trigger** node → set credential to `Gmail OAuth2`
3. Click the **Log to Google Sheets** node:
   - Set credential to `Google Sheets OAuth2`
   - Paste your **Spreadsheet ID** in the Document field
   - Sheet name: `Invoices`
4. Click the **Send Alert Email** node:
   - Set credential to `Gmail OAuth2`
   - Change the **Send To** email to yours
5. Click **Save**

---

## Step 9 — Test It

1. Click the **Gmail Trigger** node → **Listen for Test Event**
2. Forward any email with a PDF invoice to your Gmail inbox
3. Watch n8n detect it and process it
4. Check your Google Sheet — a new row should appear

---

## Step 10 — Activate the Workflow

1. Toggle **Active** switch (top right of workflow editor) → **ON**
2. n8n now polls Gmail every minute automatically
3. **Keep the terminal running** (n8n stops when you close it)

---

## Keep n8n Running in Background (Optional)

If you want n8n to keep running after closing the terminal:

```powershell
# Install pm2 process manager (one-time)
npm install -g pm2

# Start n8n with pm2 (survives terminal close)
pm2 start "npx n8n" --name n8n

# n8n now runs in background at http://localhost:5678
# To stop: pm2 stop n8n
# To restart: pm2 restart n8n
# To see logs: pm2 logs n8n
```

---

## Summary

| Step | What you do | Time |
|---|---|---|
| 1 | `npx n8n` in terminal | 2 min |
| 2 | Create local account | 1 min |
| 3 | Import workflow JSON | 1 min |
| 4 | Google Cloud OAuth setup | 5 min |
| 5 | Google Sheets OAuth | 1 min |
| 6 | Create Google Sheet | 2 min |
| 7 | Add Gemini API key | 1 min |
| 8 | Connect credentials | 2 min |
| 9 | Test with a PDF email | 2 min |
| 10 | Activate workflow | 30 sec |
| **Total** | | **~18 minutes** |

**Total cost: $0**
