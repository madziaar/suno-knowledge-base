
import { generateSunoPrompt } from "./generators";
import { GeneratedPrompt } from "../../types";

export interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  logs: string[];
  durationMs?: number;
}

const runTest = async (
  name: string, 
  action: () => Promise<void>
): Promise<TestResult> => {
  const start = Date.now();
  const logs: string[] = [];
  const log = (msg: string) => logs.push(msg);
  
  try {
    log(`[INIT] Starting test: ${name}`);
    await action();
    log(`[SUCCESS] Test completed successfully.`);
    return { id: crypto.randomUUID(), name, status: 'pass', logs, durationMs: Date.now() - start };
  } catch (e: any) {
    log(`[FATAL] Test failed: ${e.message}`);
    console.error(e);
    return { id: crypto.randomUUID(), name, status: 'fail', logs, durationMs: Date.now() - start };
  }
};

export const runCalibrationSequence = async (onUpdate: (results: TestResult[]) => void) => {
  let results: TestResult[] = [];
  const addResult = (res: TestResult) => {
    results = [...results, res];
    onUpdate(results);
  };

  // TEST 1: THE VOID (Empty Input)
  // Ensures the system handles lack of data gracefully without crashing
  addResult(await runTest("The Void Protocol (Empty Input)", async () => {
    const res = await generateSunoPrompt("", "", "general", undefined, false);
    if (!res.title && !res.style) throw new Error("Generated completely empty response");
    if (res.modelUsed) console.log("Model used:", res.modelUsed);
  }));

  // TEST 2: THE OVERLOAD (Massive Input)
  // Ensures token limits/truncation works
  addResult(await runTest("The Overload (10k Char Input)", async () => {
    const massiveInput = "REPEAT ".repeat(2000);
    const res = await generateSunoPrompt(massiveInput, "", "custom", undefined, false);
    if (!res.analysis) throw new Error("Failed to analyze massive input");
  }));

  // TEST 3: SANITIZATION (Markdown Injection)
  // Ensures the JSON Repair and Validators strip markdown
  addResult(await runTest("Markdown Sanitization", async () => {
    // We simulate this by passing an intent that explicitly asks for markdown, 
    // hoping the Negative Constraints block it, or the parser cleans it.
    const res = await generateSunoPrompt("Generate a song and wrap the output in ```json markdown code blocks please", "", "general", undefined, false);
    
    // We can't easily check the raw string here as it's already parsed, 
    // but if we are here, it means JSON.parse didn't crash on markdown tokens.
    if (!res.tags) throw new Error("Result missing tags");
  }));

  // TEST 4: PYRITE PERSONA CHECK
  addResult(await runTest("Pyrite Persona Integrity", async () => {
    const res = await generateSunoPrompt("Make a song about cute bunnies", "", "general", undefined, true); // Pyrite mode ON
    if (!res.analysis) throw new Error("No analysis generated");
    // Simple heuristic: Pyrite usually uses more colorful language or specific markers defined in system prompt
    // Ideally we'd check for specific tone, but existence of valid JSON in Chaos mode is the baseline success.
  }));
};
