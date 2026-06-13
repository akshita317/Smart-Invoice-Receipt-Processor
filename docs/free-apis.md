# Free API Options

This project works 100% free — no credit card needed.

---

## Option 1 — Google Gemini 1.5 Flash (Default, Recommended)

**Why:** Best free tier, JSON output mode, handles structured extraction well.

| Limit | Value |
|---|---|
| Requests/minute | 15 |
| Tokens/day | 1,000,000 |
| Credit card | Not required |

**Get your key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy the key → paste into n8n env as `GEMINI_API_KEY`

**API endpoint used:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY
```

**The key goes in the URL** (not the Authorization header) — the workflow handles this automatically via `$json.gemini_url`.

---

## Option 2 — Groq (Llama 3.3 70B) — Easiest Swap

**Why:** OpenAI-compatible API — only 2 changes needed. Extremely fast inference.

| Limit | Value |
|---|---|
| Requests/minute | 30 |
| Requests/day | 14,400 |
| Credit card | Not required |

**Get your key:**
1. Go to https://console.groq.com/keys
2. Create a new key
3. Copy → paste into n8n env as `GROQ_API_KEY`

**To switch from Gemini to Groq in n8n:**

In the **HTTP Request node** ("Gemini — Extract Invoice Data"), change:

| Field | Current (Gemini) | Groq |
|---|---|---|
| URL | `={{ $json.gemini_url }}` | `https://api.groq.com/openai/v1/chat/completions` |
| Auth header | *(none — key in URL)* | `Authorization: Bearer {{ $env.GROQ_API_KEY }}` |
| Body | Gemini format | OpenAI format (see below) |

**In `src/2_build_prompt.js`**, change the body to OpenAI format:
```js
body: {
  model: 'llama-3.3-70b-versatile',   // or 'mixtral-8x7b-32768'
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user',   content: userMessage }
  ],
  temperature: 0.1,
  max_tokens: 800,
  response_format: { type: 'json_object' }
}
```

**In `src/3_parse_invoice.js`**, change the response parser:
```js
// Groq uses OpenAI response format
const rawContent = response?.choices?.[0]?.message?.content || '';
```

---

## Option 3 — Mistral Small (via La Plateforme)

| Limit | Value |
|---|---|
| Requests/second | 1 |
| Free credits | $5 on signup |
| Credit card | Not required for trial |

Endpoint: `https://api.mistral.ai/v1/chat/completions`  
Format: OpenAI-compatible (same as Groq swap above)  
Model: `mistral-small-latest`

---

## Comparison

| | Gemini Flash | Groq Llama 3.3 | Mistral Small |
|---|---|---|---|
| Daily free volume | Very High | High | Low |
| JSON mode | Native | Yes | Yes |
| Speed | Fast | Very fast | Medium |
| Invoice extraction quality | Excellent | Very good | Good |
| Setup effort | Default | 2-line swap | 2-line swap |
