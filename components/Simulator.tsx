"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "./AppShell";
import { baselineCents, financials, formatUSD, parseDollarsToCents, simulateExpense } from "../lib/finance";

const examples = [
  { label: "No extra expense", cents: 0 },
  { label: "Small repair", cents: 50000 },
  { label: "Car repair", cents: 130000 },
  { label: "Major bill", cents: 200000 },
];

export default function Simulator() {
  const [expenseText, setExpenseText] = useState(String(financials.exampleExpenseCents / 100));
  const [bufferText, setBufferText] = useState(String(financials.bufferCents / 100));
  const expenseCents = parseDollarsToCents(expenseText);
  const bufferCents = parseDollarsToCents(bufferText);
  const result = expenseCents === null || bufferCents === null ? null : simulateExpense(expenseCents, bufferCents);

  return (
    <AppShell current="simulator">
      <section className="page-heading"><div><p className="eyebrow">PLAN FOR THE UNEXPECTED</p><h1>Explore your what-ifs<span className="period">.</span></h1><p className="page-description">Adjust a hypothetical expense and see the impact on your checking account in real time.</p></div><Link href="/demo" className="button button-outline">← Back to overview</Link></section>
      <div className="simulator-grid">
        <section className="panel simulator-input-panel" aria-labelledby="sim-heading">
          <div className="panel-heading"><div><h2 id="sim-heading">Build a scenario</h2><p>One-time expense this month</p></div><span className="panel-tag">Interactive</span></div>
          <label className="form-label" htmlFor="expense-input">Unexpected expense</label>
          <div className={`currency-input ${expenseCents === null ? "invalid" : ""}`}><span aria-hidden="true">$</span><input id="expense-input" value={expenseText} type="text" inputMode="decimal" autoComplete="off" onChange={(event) => setExpenseText(event.target.value)} aria-invalid={expenseCents === null} aria-describedby="expense-help" placeholder="1300" /></div>
          <p className={`form-help ${expenseCents === null ? "form-error" : ""}`} id="expense-help">{expenseCents === null ? "Enter $0 to $10,000,000 with no more than two decimal places." : "Only your projected checking balance changes; nothing is charged."}</p>
          <div className="range-container"><input type="range" min="0" max="3000" step="50" aria-label="Change the unexpected expense" value={Math.max(0, Math.min(3000, (expenseCents ?? 0) / 100))} onChange={(event) => setExpenseText(event.target.value)} /><div className="range-labels"><span>$0</span><span>$1,500</span><span>$3,000</span></div></div>
          <div className="form-separator" />
          <p className="form-label">Quick examples</p><div className="scenario-pills">{examples.map((example) => <button type="button" key={example.label} onClick={() => setExpenseText(String(example.cents / 100))} className={`scenario-pill ${expenseCents === example.cents ? "pill-active" : ""}`}>{example.label}</button>)}</div>
          <div className="form-separator" />
          <label className="form-label" htmlFor="buffer-input">Minimum checking safety buffer</label><div className={`currency-input currency-input-small ${bufferCents === null ? "invalid" : ""}`}><span aria-hidden="true">$</span><input id="buffer-input" value={bufferText} type="text" inputMode="decimal" autoComplete="off" onChange={(event) => setBufferText(event.target.value)} aria-invalid={bufferCents === null} aria-describedby="buffer-help" /></div><p className={`form-help ${bufferCents === null ? "form-error" : ""}`} id="buffer-help">{bufferCents === null ? "Enter a valid nonnegative amount, up to $10,000,000." : "A threshold for this scenario—not a bank setting."}</p>
          <button className="reset-link" type="button" onClick={() => { setExpenseText(String(financials.exampleExpenseCents / 100)); setBufferText(String(financials.bufferCents / 100)); }}>↻ Reset example</button>
        </section>
        <section className="panel result-panel" aria-labelledby="results-heading">
          <div className="panel-heading"><div><h2 id="results-heading">Your projected outcome</h2><p>An estimate based on this month's sample values</p></div><span className="panel-tag">Live result</span></div>
          {result ? <div aria-live="polite" aria-atomic="true">
            <div className="result-main"><p>Projected end-of-month checking</p><strong className={result.belowBuffer ? "result-warning-number" : "result-good-number"}>{formatUSD(result.revisedCents)}</strong><span>{result.belowZero ? "Negative projected balance" : result.belowBuffer ? "Below your safety buffer" : "Above your safety buffer"}</span></div>
            <div className="result-breakdown"><div><span>Without this expense</span><strong>{formatUSD(result.baselineCents)}</strong></div><div><span>Unexpected expense</span><strong>− {formatUSD(result.oneTimeExpenseCents)}</strong></div><div><span>Your safety buffer</span><strong>{formatUSD(result.bufferCents)}</strong></div></div>
            <div role="status" className={`outcome-message ${result.belowBuffer ? "outcome-warning" : "outcome-success"}`}><span className="outcome-icon" aria-hidden="true">{result.belowBuffer ? "!" : "✓"}</span><div><strong>{result.belowZero ? "Projected checking would be negative" : result.belowBuffer ? "Your buffer would be breached" : "Your buffer stays intact"}</strong><p>{result.belowBuffer ? `This scenario puts projected checking ${formatUSD(result.shortfallCents)} below your ${formatUSD(result.bufferCents)} safety buffer.` : `After this expense, projected checking remains at or above your ${formatUSD(result.bufferCents)} safety buffer.`}</p></div></div>
          </div> : <div className="input-invalid-message" role="status">Please enter valid amounts for both fields to calculate your scenario.</div>}
          <div className="result-footnote">Calculations use planned monthly totals; they do not predict which day a bill will be paid.</div>
        </section>
      </div>
      <section className="panel how-panel"><div className="how-icon" aria-hidden="true">∑</div><div><h2>How the math works</h2><p>We take the starting checking balance, add net monthly income, subtract planned expenses, then subtract your new expense.</p><div className="formula"><span>{formatUSD(financials.checkingCents)}</span><b>+</b><span>{formatUSD(financials.incomeCents)}</span><b>−</b><span>{formatUSD(financials.expenseCents)}</span><b>=</b><strong>{formatUSD(baselineCents)}</strong><small>baseline, before the new expense</small></div><p className="how-caption">Savings are excluded. This is a simplified fictional projection; no payments, transfers, or real financial operations occur.</p></div></section>
    </AppShell>
  );
}
