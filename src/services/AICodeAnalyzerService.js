import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

const SYSTEM_PROMPT = `You are an expert DSA tutor. Respond ONLY with a valid JSON object, no markdown, no backticks, nothing else.

JSON structure:
{
  "isValid": true,
  "language": "C++",
  "algorithmName": "name",
  "category": "Array/Sorting/Searching/etc",
  "isCorrect": true,
  "bugs": [],
  "correctedCode": "",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "explanation": "2-3 sentences",
  "howItWorks": ["step 1", "step 2"],
  "codeLines": [{"line": "code", "explain": "plain english"}],
  "defaultInput": [1,1,2,3,3,4],
  "steps": [
    {
      "arr": [],
      "highlight": [],
      "secondary": [],
      "done": [],
      "eliminated": [],
      "swap": [],
      "pointers": {"0": "i"},
      "activeLine": 0,
      "msg": "beginner friendly message"
    }
  ]
}

Simulate every step on defaultInput. Keep msgs beginner-friendly (explain like teaching a 15 year old).
If invalid/not DSA: isValid=false, steps=[].
If bugs: isCorrect=false, list bugs, correctedCode, simulate corrected version.`;

export class AICodeAnalyzerService {
  static async analyzeCode(code) {
    try {
      const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const groqKey = import.meta.env.VITE_groqApi || import.meta.env.VITE_GROQ_API_KEY;
      
      const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this code and return JSON:\n\n${code}`;
      let responseText = "";
      let lastError = null;

      // Real Fallback Cascade
      const tryFetch = async (fetchLogic) => {
        if (responseText) return; // already succeeded
        try {
          responseText = await fetchLogic();
        } catch (e) {
          console.warn("AI Fallback triggered due to error:", e.message);
          lastError = e;
        }
      };

      if (geminiKey) {
        await tryFetch(async () => {
          const res = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, apiKey: geminiKey })
          });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Gemini Proxy Error: ${res.status} ${txt}`);
          }
          const data = await res.json();
          if (!data.text || data.error) throw new Error(data.error || "Empty response from Gemini");
          return data.text;
        });
      }

      if (openAiKey) {
        await tryFetch(async () => {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              response_format: { type: "json_object" },
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
          const data = await res.json();
          return data.choices[0].message.content;
        });
      }

      if (openRouterKey) {
        await tryFetch(async () => {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "http://localhost:5173",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
          const data = await res.json();
          return data.choices[0].message.content;
        });
      }

      if (groqKey) {
        await tryFetch(async () => {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
          const data = await res.json();
          return data.choices[0].message.content;
        });
      }

      if (!responseText) {
        throw new Error(lastError ? `All API fallbacks failed. Last Error: ${lastError.message}` : "No valid API keys found in .env");
      }

      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("Initial JSON parse failed, attempting jsonrepair:", parseError);
        const repairedJSON = jsonrepair(responseText);
        parsed = JSON.parse(repairedJSON);
      }

      return {
        success: true,
        data: parsed
      };

    } catch (e) {
      console.error("AI Code Analyzer failed:", e);
      return {
        success: false,
        error: e.message || "Failed to analyze code."
      };
    }
  }
}
