import data from "../data/demo-data.json";

export type Category = {
  category: string;
  amount_cents: number;
  optional: boolean;
};

const demo = data;
const checking = demo.accounts.find((account) => account.id === "checking");
const savings = demo.accounts.find((account) => account.id === "savings");
if (!checking || !savings) throw new Error("Demo financial accounts are missing.");

export const financials = {
  name: demo.profile.name,
  checkingCents: checking.starting_balance_cents,
  savingsCents: savings.starting_balance_cents,
  incomeCents: demo.net_monthly_income_cents,
  expenses: demo.planned_monthly_expenses as Category[],
  expenseCents: demo.planned_monthly_expenses.reduce((sum, item) => sum + item.amount_cents, 0),
  bufferCents: demo.checking_safety_buffer_cents,
  exampleExpenseCents: demo.example_scenario.one_time_expense_cents,
};

export const surplusCents = financials.incomeCents - financials.expenseCents;
export const baselineCents = financials.checkingCents + surplusCents;

export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// The input stays in integer cents, so we avoid floating-point money math.
// The upper bound protects a simple demo from impractically large inputs.
export function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim();
  if (!/^(?:\d{1,8})(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents <= 1000000000 ? cents : null;
}

export function simulateExpense(oneTimeExpenseCents: number, bufferCents = financials.bufferCents) {
  if (!Number.isSafeInteger(oneTimeExpenseCents) || oneTimeExpenseCents < 0) {
    throw new RangeError("Expense must be a nonnegative whole number of cents.");
  }
  if (!Number.isSafeInteger(bufferCents) || bufferCents < 0) {
    throw new RangeError("Buffer must be a nonnegative whole number of cents.");
  }
  const revisedCents = baselineCents - oneTimeExpenseCents;
  return {
    baselineCents,
    revisedCents,
    oneTimeExpenseCents,
    bufferCents,
    belowBuffer: revisedCents < bufferCents,
    belowZero: revisedCents < 0,
    shortfallCents: Math.max(0, bufferCents - revisedCents),
  };
}
