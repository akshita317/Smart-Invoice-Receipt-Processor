# Google Sheets Schema — Smart Invoice & Receipt Processor

## Sheet name: `Invoices`

Create a new Google Sheet, rename the first tab to **Invoices**, and add these headers in Row 1 exactly as shown:

| Column | Header | Type | Example |
| ------ | ------ | ---- | ------- |
| A | Processed At | Timestamp (ISO 8601) | `2025-12-13T09:15:42.000Z` |
| B | Vendor | Text | `Amazon Web Services India Pvt Ltd` |
| C | Invoice Number | Text | `IN-2025-00847` |
| D | Date | Date (YYYY-MM-DD) | `2025-11-15` |
| E | Due Date | Date (YYYY-MM-DD) or blank | `2025-12-01` |
| F | Amount | Number | `12450` |
| G | Currency | Text (3-letter ISO) | `INR` |
| H | Tax | Number | `1890.68` |
| I | Payment Method | Text | `Credit Card` |
| J | Line Items | JSON string | `[{"description":"EC2","amount":8000}]` |
| K | Has Anomaly | Boolean | `TRUE` or `FALSE` |
| L | Anomaly Details | Text | `High amount: INR 12450.00` |
| M | Email Subject | Text | `Your AWS Invoice for November 2025` |
| N | Email From | Text | `billing@amazon.com` |
| O | Filename | Text | `AWS-Invoice-Nov-2025.pdf` |

## Quick setup

1. Go to [sheets.google.com](https://sheets.google.com) → **New Spreadsheet**
2. Rename the first sheet tab to `Invoices`
3. Paste the 15 column headers above into Row 1 (A1 through O1)
4. Copy your Spreadsheet ID from the URL:

   ```text
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

5. Paste the ID into the **Log to Google Sheets** node in n8n (Document field)

## Recommended formatting

- Column A: Format as **Date time**
- Columns D, E: Format as **Date**
- Columns F, H: Format as **Number** (2 decimal places)
- Column K: Format as **Plain text** (n8n sends `true`/`false` as strings)
- Column J: Format as **Plain text** (contains JSON)
