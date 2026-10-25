import Link from "next/link";
import AppShell from "./AppShell";
import { baselineCents, financials, formatUSD, surplusCents } from "../lib/finance";

const accentClasses = ["mint", "purple", "blue", "gold", "rose", "teal", "pink", "slate"];

export default function Dashboard() {
  const largestCategory = Math.max(...financials.expenses.map((e) => e.amount_cents));
  const expenseShare = Math.min(100, (financials.expenseCents / financials.incomeCents) * 100);
  let offset = 0;
  const portions = financials.expenses.map((e, i) => {
    const start = offset;
    offset += (e.amount_cents / financials.expenseCents) * 100;
    return `${["#44d6aa", "#9683fa", "#7bb9ff", "#f9bf6d", "#f48aa0", "#70d0d1", "#dba6ff", "#71839b"][i % 8]} ${start}% ${offset}%`;
  });

  return (
    <AppShell current="dashboard">
      <section className="page-heading">
        <div><p className="eyebrow">YOUR FINANCIAL SNAPSHOT</p><h1>Money made simple<span className="period">.</span></h1><p className="page-description">A clearer picture of where your money stands and what could happen next.</p></div>
        <Link href="/demo/simulator" className="button button-primary">Try a scenario <span aria-hidden="true">↗</span></Link>
      </section>

      <div className="section-label-row"><h2 className="section-label">Account overview</h2><span className="muted-small">Sample monthly figures · USD</span></div>
      <section className="metrics" aria-label="Financial overview">
        <article className="stat-card"><div className="stat-top"><span>Checking balance</span><span className="stat-icon mint-bg" aria-hidden="true">◈</span></div><strong className="stat-value">{formatUSD(financials.checkingCents)}</strong><div className="stat-note"><span className="small-dot mint-dot" /> Starting checking balance</div></article>
        <article className="stat-card"><div className="stat-top"><span>Savings balance</span><span className="stat-icon purple-bg" aria-hidden="true">⌑</span></div><strong className="stat-value">{formatUSD(financials.savingsCents)}</strong><div className="stat-note"><span className="small-dot violet-dot" /> Not counted as checking</div></article>
        <article className="stat-card"><div className="stat-top"><span>Monthly income</span><span className="stat-icon blue-bg" aria-hidden="true">↙</span></div><strong className="stat-value">{formatUSD(financials.incomeCents)}</strong><div className="stat-note"><span className="small-dot blue-dot" /> Take-home income</div></article>
        <article className="stat-card"><div className="stat-top"><span>Monthly expenses</span><span className="stat-icon gold-bg" aria-hidden="true">↗</span></div><strong className="stat-value">{formatUSD(financials.expenseCents)}</strong><div className="stat-note"><span className="small-dot amber-dot" /> {financials.expenses.length} planned categories</div></article>
      </section>

      <section className="panel-grid">
        <article className="panel cash-flow">
          <div className="panel-heading"><div><h2>Cash flow overview</h2><p>How money moves through your monthly plan</p></div><span className="panel-tag">Monthly</span></div>
          <div className="cash-flow-highlight"><span>Money left after expenses</span><div><strong>{formatUSD(surplusCents)}</strong><span className="positive-chip">Monthly surplus</span></div></div>
          <div className="flow-meter-heading"><span>Planned income allocation</span><span>{Math.round(expenseShare)}% spent</span></div>
          <div className="flow-meter" role="img" aria-label={`${Math.round(expenseShare)}% of monthly income is allocated to planned expenses`}><span style={{ width: `${expenseShare}%` }} /></div>
          <div className="flow-legend"><span><i className="legend-dot mint-dot" /> Expenses {formatUSD(financials.expenseCents)}</span><span><i className="legend-dot violet-dot" /> Left over {formatUSD(surplusCents)}</span></div>
          <div className="forecast"><div><p>Projected end-of-month checking</p><span>Starting balance + income − expenses</span></div><strong>{formatUSD(baselineCents)}</strong></div>
        </article>

        <article className="panel spending-panel">
          <div className="panel-heading"><div><h2>Where it goes</h2><p>Planned expenses by category</p></div><span className="panel-tag">Budget</span></div>
          <div className="spending-chart-row"><div className="donut" style={{ background: `conic-gradient(${portions.join(", ")})` }} role="img" aria-label="Donut chart showing planned spending categories"><div className="donut-hole"><span>Total planned</span><strong>{formatUSD(financials.expenseCents)}</strong></div></div>
            <div className="category-top"><span>Largest category</span><strong>{financials.expenses.find((e) => e.amount_cents === largestCategory)?.category}</strong><p>{formatUSD(largestCategory)} / month</p><span className="secondary-copy">View category amounts below</span></div>
          </div>
          <div className="category-grid">
            {financials.expenses.map((item, i) => <div key={item.category} className="category-item"><span className={`category-dot ${accentClasses[i % accentClasses.length]}`} /><span className="category-name">{item.category}</span><strong>{formatUSD(item.amount_cents)}</strong></div>)}
          </div>
        </article>
      </section>

      <section className="feature-callout"><div className="callout-symbol" aria-hidden="true">↗</div><div className="feature-copy"><span className="callout-eyebrow">FINANCIAL DIGITAL TWIN · LIGHT VERSION</span><h2>What if an unexpected bill showed up?</h2><p>Try a car repair or other surprise expense to see your projected checking balance—and whether it stays above your safety buffer.</p></div><Link href="/demo/simulator" className="button button-light">Open simulator <span aria-hidden="true">→</span></Link></section>
    </AppShell>
  );
}
