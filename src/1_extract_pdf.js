/**
 * n8n Code Node — Step 1: Extract text from PDF attachment
 *
 * Input:  Gmail Trigger output (binary attachment in $input.first().binary)
 * Output: { text: string, filename: string, email_id: string, email_subject: string }
 *
 * Paste this entire file into the n8n Code node (JavaScript mode).
 */

const item = $input.first();

// Find the first PDF attachment key in the binary data
const binaryKeys = Object.keys(item.binary || {});
const pdfKey = binaryKeys.find(k =>
  (item.binary[k].mimeType || '').includes('pdf') ||
  (item.binary[k].fileName || '').toLowerCase().endsWith('.pdf')
) || binaryKeys[0];

if (!pdfKey) {
  return [{ json: { error: 'No attachment found', skip: true } }];
}

const attachment = item.binary[pdfKey];

// Get the raw binary buffer from n8n's binary data store
const buffer = await this.helpers.getBinaryDataBuffer(item, pdfKey);

// --- PDF text extraction (works for text-based PDFs, not scanned images) ---
// Strategy: PDFs store text in streams between BT...ET markers.
// We extract printable ASCII runs and clean them up.
let extractedText = '';

try {
  const raw = buffer.toString('latin1');

  // Extract all text between BT (Begin Text) and ET (End Text) PDF operators
  const textBlocks = raw.match(/BT[\s\S]*?ET/g) || [];

  if (textBlocks.length > 0) {
    extractedText = textBlocks
      .join(' ')
      // Remove PDF operators and numeric sequences
      .replace(/\b(Td|Tm|Tf|Tj|TJ|Tr|Ts|Tw|Tc|BT|ET|rg|RG|cm|Do|q|Q)\b/g, ' ')
      .replace(/\[|\]|\(|\)/g, ' ')
      .replace(/\\\d{3}/g, '')          // Remove octal escape sequences
      .replace(/[^\x20-\x7E\n]/g, ' ') // Keep only printable ASCII
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Fallback: if BT/ET extraction yields too little, grab all printable characters
  if (extractedText.length < 80) {
    extractedText = raw
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 4000); // cap to avoid token overflow
  }

} catch (e) {
  extractedText = `[PDF extraction error: ${e.message}]`;
}

return [{
  json: {
    text: extractedText.substring(0, 4000), // keep within token limits
    filename: attachment.fileName || 'invoice.pdf',
    email_id: item.json.id || '',
    email_subject: item.json.subject || '',
    email_from: item.json.from || '',
  }
}];
