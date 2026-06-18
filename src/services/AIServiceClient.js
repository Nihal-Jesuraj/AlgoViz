import { jsonrepair } from 'jsonrepair';

const PROVIDERS = [
  {
    key: 'gemini',
    envVar: 'VITE_GEMINI_API_KEY',
    fetch: (prompt, apiKey) =>
      fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey })
      }).then(async res => {
        if (!res.ok) throw new Error(`Gemini Proxy Error: ${res.status} ${await res.text()}`);
        const data = await res.json();
        if (!data.text || data.error) throw new Error(data.error || 'Empty response from Gemini');
        return data.text;
      })
  },
  {
    key: 'openai',
    envVar: 'VITE_OPENAI_API_KEY',
    fetch: (prompt, apiKey) =>
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }]
        })
      }).then(async res => {
        if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content;
      })
  },
  {
    key: 'openrouter',
    envVar: 'VITE_OPENROUTER_API_KEY',
    fetch: (prompt, apiKey) =>
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }]
        })
      }).then(async res => {
        if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
        const data = await res.json();
        return data.choices[0].message.content;
      })
  },
  {
    key: 'groq',
    envVar: 'VITE_GROQ_API_KEY',
    fetch: (prompt, apiKey) =>
      fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey, model: 'llama-3.3-70b-versatile' })
      }).then(async res => {
        if (!res.ok) throw new Error(`Groq Proxy Error: ${res.status} ${await res.text()}`);
        const data = await res.json();
        if (!data.text || data.error) throw new Error(data.error || 'Empty response from Groq');
        return data.text;
      })
  }
];

export async function callAIWithFallback(prompt) {
  let responseText = '';
  let lastError = null;

  for (const provider of PROVIDERS) {
    if (responseText) break;
    const apiKey = import.meta.env[provider.envVar] || (provider.altEnvVar ? import.meta.env[provider.altEnvVar] : null);
    if (!apiKey) continue;

    try {
      responseText = await provider.fetch(prompt, apiKey);
    } catch (e) {
      console.warn(`${provider.key} failed:`, e.message);
      lastError = e;
    }
  }

  if (!responseText) {
    throw new Error(lastError ? `All API fallbacks failed. Last Error: ${lastError.message}` : 'No API keys found in .env');
  }

  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.warn('Initial JSON parse failed, attempting jsonrepair:', parseError);
    try {
      return JSON.parse(jsonrepair(responseText));
    } catch {
      console.error('jsonrepair also failed. Raw end:', responseText.substring(responseText.length - 200));
      throw new Error('AI returned severely truncated or invalid JSON.');
    }
  }
}
