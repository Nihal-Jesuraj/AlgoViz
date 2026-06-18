import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Loader2 } from 'lucide-react';
import { AICodeAnalyzerService } from '../../services/AICodeAnalyzerService';

const DEMOS = {
  remove_dup: {
    label: "C++ Remove Duplicates",
    code: `// C++ - Remove Duplicates from Sorted Array
int removeDuplicates(vector<int>& nums) {
    int count = 1;
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] != nums[i-1]) {
            nums[count] = nums[i];
            count++;
        }
    }
    return count;
}`
  },
  binary: {
    label: "Python Binary Search",
    code: `# Python - Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
  },
  two_sum: {
    label: "JS Two Pointers",
    code: `// JavaScript - Two Pointers
function twoSum(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        let sum = arr[left] + arr[right];
        if (sum === target) return [left, right];
        else if (sum < target) left++;
        else right--;
    }
    return [-1, -1];
}`
  }
};

export default function ArrayCodeTab({ onLoadGraph }) {
  const [rawCodeInput, setRawCodeInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!rawCodeInput.trim()) return;
    setIsAnalyzing(true);
    setError('');
    const res = await AICodeAnalyzerService.analyzeCode(rawCodeInput);
    setIsAnalyzing(false);
    if (res.success) {
      onLoadGraph({ isArrayAnalysis: true, arrayData: res.data });
    } else {
      setError(res.error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-2xl mx-auto mt-2 h-full">
      <div className="text-center">
        <h3 className="font-semibold text-[var(--color-text)] mb-1">Raw Code Dry Run</h3>
        <p className="text-xs text-[var(--color-text-subtle)]">Paste your Array, Sorting, or Two Pointers code (C++, Java, Python, JS). We will use AI to perform a line-by-line step visualization.</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mt-2 mb-1">
        <span className="font-heading text-[10px] text-[var(--color-text-subtle)] font-semibold uppercase tracking-wider self-center mr-1">Try a demo:</span>
        {Object.entries(DEMOS).map(([key, d]) => (
          <button key={key} onClick={() => setRawCodeInput(d.code)} className="px-3 py-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] hover:bg-[var(--color-accent)] transition-colors text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label={`Load ${d.label} demo`}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <textarea className="glass-input flex-1 !p-4 font-mono text-sm leading-relaxed" placeholder={`// Example: Bubble Sort\nvoid bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`} value={rawCodeInput} onChange={(e) => setRawCodeInput(e.target.value)} aria-label="Code input for analysis" />
      </div>
      {error && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</div>}
      <button className="glass-button !py-3.5 primary w-full font-semibold shadow-glass-elevated flex items-center justify-center gap-2" onClick={handleAnalyze} disabled={isAnalyzing} aria-label="Analyze code">
        {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Code size={18} />}
        {isAnalyzing ? 'Analyzing Code...' : 'Analyze & Visualize'}
      </button>
    </motion.div>
  );
}
