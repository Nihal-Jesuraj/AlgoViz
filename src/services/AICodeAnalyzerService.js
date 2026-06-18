import { callAIWithFallback } from './AIServiceClient';

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
      const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this code and return JSON:\n\n${code}`;
      const parsed = await callAIWithFallback(prompt);

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
