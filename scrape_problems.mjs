import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import problems directly (requires resolving ES module or parsing)
// To avoid dealing with ES module import complexities in a script, let's just parse the file via regex
const problemsFilePath = path.join(__dirname, 'src', 'data', 'problems.js');
const problemsContent = fs.readFileSync(problemsFilePath, 'utf8');

const urlRegex = /id:\s*'([^']+)'[^}]*leetcodeUrl:\s*'([^']+)'/g;
let match;
const problemsToScrape = [];

while ((match = urlRegex.exec(problemsContent)) !== null) {
  problemsToScrape.push({ id: match[1], url: match[2] });
}

console.log(`Found ${problemsToScrape.length} problems to scrape.`);

async function scrapeUrl(url) {
  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const json = await response.json();
    const html = json.contents;
    
    // Look for adj = [[...]] or edges = [[...]]
    const arrayRegex = /\[\s*\[.*?\]\s*\]/g;
    const matches = html.match(arrayRegex);
    if (matches && matches.length > 0) {
      // Find the first one that looks like a valid graph array (contains numbers)
      for (const m of matches) {
        if (/\d/.test(m) && m.length < 500) {
          // Normalize formatting
          const clean = m.replace(/\s+/g, ' ').trim();
          return clean;
        }
      }
    }
    return null;
  } catch (e) {
    console.error(`Failed to scrape ${url}:`, e.message);
    return null;
  }
}

async function run() {
  const scrapedData = {};
  
  for (let i = 0; i < problemsToScrape.length; i++) {
    const p = problemsToScrape[i];
    console.log(`Scraping [${i+1}/${problemsToScrape.length}] ${p.id}...`);
    const result = await scrapeUrl(p.url);
    if (result) {
      scrapedData[p.id] = result;
      console.log(`  -> Found: ${result}`);
    } else {
      console.log(`  -> No array found.`);
    }
    // Small delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Now modify problems.js to inject these inputs
  let newContent = problemsContent;
  let injectedCount = 0;
  
  for (const [id, inputStr] of Object.entries(scrapedData)) {
    // Find the problem block
    const blockRegex = new RegExp(`(id:\\s*'${id}'[^}]*algorithmKey:\\s*'[^']+',)`,"g");
    newContent = newContent.replace(blockRegex, `$1 input: '${inputStr}',`);
    injectedCount++;
  }
  
  fs.writeFileSync(problemsFilePath, newContent, 'utf8');
  console.log(`\nSuccessfully injected ${injectedCount} scraped inputs into problems.js!`);
}

run();
