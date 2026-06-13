/**
 * n8n Code Node — Step 3: Parse OpenAI response into clean invoice object
 *
 * Input:  HTTP Request node output (OpenAI API response)
 * Output: Flat invoice object ready for Google Sheets + anomaly detection
 *
 * Paste this entire file into the n8n Code node (JavaScript mode).
 */

const response = $input.first().json;

// Pull the raw content string from OpenAI response
const rawContent = response?.choices?.[0]?.message?.content || '';

let invoice = {};
try {
  invoice = JSON.parse(rawContent);
} catch (e) {
  // Try to extract JSON block if LLM added surrounding text
  const match = rawContent.match(/\{[\s\S]*\}/);
  try {
    invoice = match ? JSON.parse(match[0]) : {};
  } catch {
    invoice = {};
  }
}

// Normalise and enforce types
const clean = {
  vendor:          String(invoice.vendor         || 'Unknown').trim(),
  invoice_number:  String(invoice.invoice_number || 'N/A').trim(),
  date:            String(invoice.date            || '').trim(),
  due_date:        invoice.due_date ? String(invoice.due_date).trim() : null,
  amount:          parseFloat(invoice.amount)  || 0,
  currency:        String(invoice.currency     || 'USD').trim().toUpperCase(),
  tax:             parseFloat(invoice.tax)     || 0,
  line_items:      Array.isArray(invoice.line_items) ? invoice.line_items.slice(0, 10) : [],
  payment_method:  String(invoice.payment_method || 'Unknown').trim(),
  notes:           invoice.notes ? String(invoice.notes).trim() : null,

  // Metadata from earlier steps (passed forward via the body object)
  email_id:        $('Build OpenAI Payload').first().json.email_id    || '',
  email_subject:   $('Build OpenAI Payload').first().json.email_subject || '',
  email_from:      $('Build OpenAI Payload').first().json.email_from   || '',
  filename:        $('Build OpenAI Payload').first().json.filename      || '',
  processed_at:    new Date().toISOString(),
};

// Validate date format; reset to today if unparseable
if (clean.date && isNaN(Date.parse(clean.date))) {
  clean.date = new Date().toISOString().split('T')[0];
}

return [{ json: clean }];
