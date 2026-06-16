import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent("Hello");
    console.log("gemini-1.5-flash works:", res.response.text());
  } catch (e) {
    console.error("gemini-1.5-flash failed:", e.message);
  }
}
run();
