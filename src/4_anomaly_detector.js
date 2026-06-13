/**
 * n8n Code Node — Step 4: Anomaly Detection
 *
 * Input:  Parsed invoice object from Step 3
 * Output: Same invoice + { has_anomaly: bool, anomalies: string[], anomaly_summary: string }
 *
 * Paste this entire file into the n8n Code node (JavaScript mode).
 *
 * To enable duplicate detection, connect this node AFTER the Google Sheets
 * "Read All Rows" node and pass existing rows in as additional input.
 * For a simpler setup, duplicate detection is skipped (relies only on rule checks).
 */

const invoice = $input.first().json;
const anomalies = [];

// ── Rule 1: Unusually high amount ─────────────────────────────────────────────
const HIGH_AMOUNT_THRESHOLD = 10000; // USD — adjust for your context
if (invoice.amount > HIGH_AMOUNT_THRESHOLD) {
  anomalies.push(`High amount: ${invoice.currency} ${invoice.amount.toFixed(2)} (threshold: ${HIGH_AMOUNT_THRESHOLD})`);
}

// ── Rule 2: Zero or negative amount ───────────────────────────────────────────
if (invoice.amount <= 0) {
  anomalies.push(`Invalid amount: ${invoice.amount} — zero or negative total`);
}

// ── Rule 3: Unknown vendor ────────────────────────────────────────────────────
if (!invoice.vendor || invoice.vendor === 'Unknown' || invoice.vendor.length < 2) {
  anomalies.push('Vendor name could not be extracted from the invoice');
}

// ── Rule 4: Missing invoice number ────────────────────────────────────────────
if (!invoice.invoice_number || invoice.invoice_number === 'N/A') {
  anomalies.push('Invoice number is missing or unreadable');
}

// ── Rule 5: Future-dated invoice ──────────────────────────────────────────────
if (invoice.date) {
  const invoiceDate = new Date(invoice.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!isNaN(invoiceDate) && invoiceDate > today) {
    anomalies.push(`Future invoice date detected: ${invoice.date}`);
  }
}

// ── Rule 6: Tax exceeds 50% of total ─────────────────────────────────────────
if (invoice.tax > 0 && invoice.amount > 0) {
  const taxRate = invoice.tax / invoice.amount;
  if (taxRate > 0.5) {
    anomalies.push(`Tax (${invoice.currency} ${invoice.tax}) is ${(taxRate * 100).toFixed(1)}% of total — unusually high`);
  }
}

// ── Rule 7: Line items total doesn't match invoice total ─────────────────────
if (invoice.line_items && invoice.line_items.length > 0) {
  const lineTotal = invoice.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const diff = Math.abs(lineTotal - invoice.amount);
  if (diff > 1 && lineTotal > 0) { // allow $1 rounding tolerance
    anomalies.push(`Line items total (${invoice.currency} ${lineTotal.toFixed(2)}) does not match invoice total (${invoice.currency} ${invoice.amount.toFixed(2)})`);
  }
}

// ── Rule 8: Overdue invoice ───────────────────────────────────────────────────
if (invoice.due_date) {
  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  if (!isNaN(dueDate) && dueDate < today) {
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    anomalies.push(`Invoice is overdue by ${daysOverdue} day(s) — due: ${invoice.due_date}`);
  }
}

const summary = anomalies.length > 0
  ? anomalies.join(' | ')
  : 'No anomalies detected';

return [{
  json: {
    ...invoice,
    has_anomaly:      anomalies.length > 0,
    anomaly_count:    anomalies.length,
    anomalies:        anomalies,
    anomaly_summary:  summary,
  }
}];
