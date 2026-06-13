/**
 * n8n Code Node — Step 2: Build Gemini API request payload
 *
 * Uses Google Gemini 1.5 Flash (FREE — 1M tokens/day, no credit card)
 * Get API key: https://aistudio.google.com/app/apikey
 *
 * Input:  Output from Step 1 (extracted PDF text)
 * Output: { body: object, gemini_url: string, ... }
 *
 * The output feeds into an HTTP Request node:
 *   POST {{ $json.gemini_url }}
 *   Body: {{ JSON.stringify($json.body) }}
 */

const { text, filename, email_subject, email_from, email_id } = $input.first().json;

// Get API key from n8n environment variable
const GEMINI_API_KEY = $env.GEMINI_API_KEY;

const prompt = `Extract structured invoice data from the text below and return ONLY valid JSON — no markdown, no explanation.

Required schema:
{
  "vendor": "Company name that issued the invoice",
  "invoice_number": "Invoice or receipt number",
  "date": "YYYY-MM-DD",
  "due_date": "YYYY-MM-DD or null",
  "amount": 0,
  "currency": "3-letter ISO code e.g. USD INR EUR",
  "tax": 0,
  "line_items": [
    { "description": "item", "quantity": 1, "unit_price": 0, "amount": 0 }
  ],
  "payment_method": "Credit Card or Bank Transfer or Unknown",
  "notes": "any relevant notes or null"
}

Rules:
- Missing strings = null, missing numbers = 0
- amount = final total AFTER tax
- Dates must be YYYY-MM-DD
- Max 10 line items
- No currency symbols in numeric fields

Invoice filename: ${filename}
Sender: ${email_from}
Subject: ${email_subject}

--- INVOICE TEXT ---
${text}
--- END ---`;

return [{
  json: {
    email_id,
    filename,
    email_subject,
    email_from,
    // Gemini endpoint — key goes in the URL (not Authorization header)
    gemini_url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    body: {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json'   // forces Gemini to return pure JSON
      }
    }
  }
}];
