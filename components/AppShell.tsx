import type { ReactNode } from "react";
import Link from "next/link";
import Brand from "./Brand";

type AppShellProps = { current: "dashboard" | "simulator" | "assistant"; children: ReactNode };

export default function AppShell({ current, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-head">
          <Brand />
          <p>YOUR FINANCIAL WORKSPACE</p>
        </div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          <span className="nav-caption">WORKSPACE</span>
          <Link className={`nav-item ${current === "dashboard" ? "active" : ""}`} href="/demo" aria-current={current === "dashboard" ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">▦</span> Overview
          </Link>
          <Link className={`nav-item ${current === "simulator" ? "active" : ""}`} href="/demo/simulator" aria-current={current === "simulator" ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">↗</span> What-if simulator
          </Link>
          <span className="nav-caption nav-caption-space">FINANCIAL INTELLIGENCE</span>
          <Link className={`nav-item ${current === "assistant" ? "active" : ""}`} href="/demo/assistant" aria-current={current === "assistant" ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">✳</span> Budget guide
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-info-icon" aria-hidden="true">✧</div>
          <strong>Made for exploring</strong>
          <p>Practice financial decisions with sample data and zero real-world risk.</p>
          <span className="version-label">FICTIONAL DATA · INTERACTIVE DEMO</span>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><Brand /></div>
          <div className="breadcrumbs"><span>Workspace</span><span className="separator">/</span><strong>{current === "dashboard" ? "Overview" : current === "simulator" ? "What-if simulator" : "AI assistant"}</strong></div>
          <div className="top-actions"><span className="demo-pill"><span className="demo-dot" /> Demo mode</span><span className="avatar" title="Alex — fictional demo profile">A</span></div>
        </header>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/demo" className={current === "dashboard" ? "selected" : ""}>Overview</Link>
          <Link href="/demo/simulator" className={current === "simulator" ? "selected" : ""}>Simulator</Link>
          <Link href="/demo/assistant" className={current === "assistant" ? "selected" : ""}>AI assistant</Link>
        </nav>
        <main className="content">
          <div className="disclaimer"><span className="disclaimer-symbol" aria-hidden="true">i</span><span><strong>Fictional demo data</strong> — No bank accounts are linked. No real payments or financial actions can happen here.</span></div>
          {children}
          <footer className="footer"><span>MyPortfolio • Interactive demo</span><span>Educational estimates only · Not financial advice</span></footer>
        </main>
      </div>
    </div>
  );
}
