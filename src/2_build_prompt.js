/**
 * n8n Code Node — Step 2: Build OpenAI API request payload
 *
 * Input:  Output from Step 1 (extracted PDF text)
 * Output: { body: object }  — ready to POST to OpenAI Chat Completions
 *
 * Paste this entire file into the n8n Code node (JavaScript mode).
 * The output feeds directly into an HTTP Request node targeting:
 *   POST https://api.openai.com/v1/chat/completions
 */

const { text, filename, email_subject, email_from, email_id } = $input.first().json;

const systemPrompt = `You are an invoice data extraction specialist.
Extract structured data from the invoice text provided and return ONLY valid JSON.
No explanation, no markdown — pure JSON only.

Return this exact schema:
{
  "vendor": "Company name that issued the invoice",
  "invoice_number": "Invoice/receipt number or ID",
  "date": "YYYY-MM-DD format",
  "due_date": "YYYY-MM-DD or null",
  "amount": numeric total (no currency symbol, just the number),
  "currency": "3-letter ISO code e.g. USD, INR, EUR",
  "tax": numeric tax amount or 0,
  "line_items": [
    { "description": "item description", "quantity": 1, "unit_price": 0, "amount": 0 }
  ],
  "payment_method": "Credit Card / Bank Transfer / Unknown",
  "notes": "any important notes or null"
}

Rules:
- If a field cannot be found, use null for strings and 0 for numbers
- For amount, use the final total (after tax)
- Dates must be YYYY-MM-DD; if year is missing, assume current year
- Line items: include up to 10 items maximum`;

const userMessage = `Invoice filename: ${filename}
Sender: ${email_from}
Subject: ${email_subject}

--- EXTRACTED TEXT ---
${text}
--- END ---

Extract the invoice data and return JSON only.`;

return [{
  json: {
    email_id,
    filename,
    email_subject,
    email_from,
    body: {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage }
      ],
      temperature: 0.1,     // low temp = consistent, factual output
      max_tokens: 800,
      response_format: { type: 'json_object' }
    }
  }
}];
