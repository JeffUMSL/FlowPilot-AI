import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = JSON.parse(readFileSync(path.join(root, "data/demo-data.json"), "utf8"));
const checking = data.accounts.find((a) => a.id === "checking")?.starting_balance_cents;
const savings = data.accounts.find((a) => a.id === "savings")?.starting_balance_cents;
const expenses = data.planned_monthly_expenses.reduce((sum, item) => sum + item.amount_cents, 0);
const surplus = data.net_monthly_income_cents - expenses;
const baseline = checking + surplus;
const revised = baseline - data.example_scenario.one_time_expense_cents;
const shortfall = Math.max(0, data.checking_safety_buffer_cents - revised);
const checks = {
  checking: checking === 120000,
  savings: savings === 350000,
  income: data.net_monthly_income_cents === 320000,
  expenses: expenses === 290000,
  surplus: surplus === 30000,
  baseline: baseline === 150000,
  afterRepair: revised === 20000,
  bufferShortfall: shortfall === 30000,
};
for (const [name, success] of Object.entries(checks)) console.log(`${success ? "PASS" : "FAIL"}  ${name}`);
if (Object.values(checks).some((pass) => !pass)) process.exitCode = 1;
else console.log("\nAll eight fictional demo-data checks passed.");
