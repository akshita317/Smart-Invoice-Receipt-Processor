/**
 * n8n Code Node — Step 3: Parse Gemini API response into clean invoice object
 *
 * Gemini response shape:
 * {
 *   candidates: [{
 *     content: { parts: [{ text: "...json string..." }] }
 *   }]
 * }
 *
 * Input:  HTTP Request node output (Gemini API response)
 * Output: Flat invoice object ready for Google Sheets + anomaly detection
 */

const response = $input.first().json;

// Extract the text from Gemini's nested response
const rawContent = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

let invoice = {};
try {
  invoice = JSON.parse(rawContent);
} catch (e) {
  // Fallback: strip any markdown fences if Gemini ignored the mime type setting
  const match = rawContent.match(/```json\n?([\s\S]*?)\n?```/) ||
                rawContent.match(/\{[\s\S]*\}/);
  try {
    invoice = match ? JSON.parse(match[1] || match[0]) : {};
  } catch {
    invoice = {};
  }
}

// Pull metadata saved from Step 2
const prev = $('Build Gemini Payload').first().json;

// Normalise and enforce types
const clean = {
  vendor:          String(invoice.vendor         || 'Unknown').trim(),
  invoice_number:  String(invoice.invoice_number || 'N/A').trim(),
  date:            String(invoice.date            || new Date().toISOString().split('T')[0]).trim(),
  due_date:        invoice.due_date ? String(invoice.due_date).trim() : null,
  amount:          parseFloat(invoice.amount)  || 0,
  currency:        String(invoice.currency     || 'USD').trim().toUpperCase(),
  tax:             parseFloat(invoice.tax)     || 0,
  line_items:      Array.isArray(invoice.line_items) ? invoice.line_items.slice(0, 10) : [],
  payment_method:  String(invoice.payment_method || 'Unknown').trim(),
  notes:           invoice.notes ? String(invoice.notes).trim() : null,

  // Metadata
  email_id:       prev.email_id      || '',
  email_subject:  prev.email_subject || '',
  email_from:     prev.email_from    || '',
  filename:       prev.filename      || '',
  processed_at:   new Date().toISOString(),
};

// Validate date; reset to today if unparseable
if (clean.date && isNaN(Date.parse(clean.date))) {
  clean.date = new Date().toISOString().split('T')[0];
}

return [{ json: clean }];
