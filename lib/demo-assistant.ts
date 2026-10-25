// Deterministic, read-only answers from the same fictional data used by the dashboard.
// This is NOT an LLM or a Strands Agents response.
import { baselineCents, financials, formatUSD, simulateExpense, surplusCents } from "./finance";

const choices = "Try: 'What is my monthly surplus?', 'Can I afford a $1,300 car repair?', 'What is my largest spending category?', or 'What if my income drops by $1,200?'";

export function getDemoAnswer(input: string): string {
  const question = input.toLowerCase();
  const numberMatch = question.match(/\$\s*([\d,]+)(?:\.(\d{1,2}))?/);
  const amountCents = numberMatch ? Math.round(Number(numberMatch[1].replaceAll(",", "")) * 100 + Number((numberMatch[2] ?? "").padEnd(2, "0"))) : null;

  if ((question.includes("income") || question.includes("pay")) && /(drop|reduc|decreas|fall|lower|lost|lose)/.test(question)) {
    const lost = amountCents ?? 120000;
    const remainingIncome = financials.incomeCents - lost;
    const projected = baselineCents - lost;
    const bufferDifference = projected - financials.bufferCents;
    return `If monthly take-home income falls by ${formatUSD(lost)}, it becomes ${formatUSD(remainingIncome)}. With the same planned expenses, the monthly net becomes ${formatUSD(remainingIncome - financials.expenseCents)} and projected end-of-month checking becomes ${formatUSD(projected)}. That is ${formatUSD(Math.abs(bufferDifference))} ${bufferDifference < 0 ? "below" : "above"} the ${formatUSD(financials.bufferCents)} buffer. This illustration does not model bill timing.`;
  }

  if (/(surplus|left over|leftover|spare money|monthly net|net income)/.test(question)) {
    return `The fictional profile has ${formatUSD(financials.incomeCents)} in monthly take-home income and ${formatUSD(financials.expenseCents)} in planned expenses. Its monthly surplus is ${formatUSD(surplusCents)}. Starting checking is ${formatUSD(financials.checkingCents)}, so projected end-of-month checking is ${formatUSD(baselineCents)} before unexpected expenses.`;
  }

  if (/(largest|biggest|highest|top|most expensive|spending category)/.test(question)) {
    const biggest = financials.expenses.reduce((best, item) => item.amount_cents > best.amount_cents ? item : best);
    return `The largest planned spending category is ${biggest.category} at ${formatUSD(biggest.amount_cents)} per month, out of ${formatUSD(financials.expenseCents)} in total monthly expenses. That's approximately ${Math.round(100 * biggest.amount_cents / financials.expenseCents)}% of planned expenses.`;
  }

  if (/(repair|unexpected|expense|afford|cost|bill|purchase|spend)/.test(question)) {
    const expense = amountCents ?? financials.exampleExpenseCents;
    if (!Number.isSafeInteger(expense) || expense < 0 || expense > 1000000000) return "Please enter a one-time amount between $0 and $10,000,000. " + choices;
    const result = simulateExpense(expense);
    return `For a one-time ${formatUSD(expense)} expense, projected end-of-month checking changes from ${formatUSD(result.baselineCents)} to ${formatUSD(result.revisedCents)}. ${result.belowBuffer ? `That's ${formatUSD(result.shortfallCents)} below` : "That remains at or above"} the ${formatUSD(result.bufferCents)} safety buffer. This is a simplified calculation with fictional numbers, not a determination of affordability.`;
  }

  if (/(checking|saving|balance|overview|budget|income|expense)/.test(question)) {
    return `The fictional profile starts with ${formatUSD(financials.checkingCents)} checking and ${formatUSD(financials.savingsCents)} savings. Monthly income is ${formatUSD(financials.incomeCents)}, planned expenses are ${formatUSD(financials.expenseCents)}, and monthly surplus is ${formatUSD(surplusCents)}. ` + choices;
  }

  return "This public demo uses predefined financial calculations, not a live AI model. " + choices;
}
