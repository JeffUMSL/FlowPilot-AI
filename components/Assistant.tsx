"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AppShell from "./AppShell";
import { financials, formatUSD, simulateExpense } from "../lib/finance";
import { getDemoAnswer } from "../lib/demo-assistant";

type AgentStatus = { ready: boolean; provider: string; message: string };
type ToolEvent = { tool: string; description: string };
type Message = { id: number; role: "assistant" | "user"; text: string; source?: "strands" | "preview" | "calculation"; tools?: ToolEvent[] };

const questions = [
  "What is my monthly surplus?",
  "Can I afford a $1,300 car repair?",
  "What is my largest spending category?",
  "What if my income drops by $1,200?",
];

export default function Assistant({ demoOnly = false }: { demoOnly?: boolean }) {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [backendRunning, setBackendRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "assistant", text: "Welcome! Explore Alex’s fictional budget with simple, verifiable calculations. The public demo does not use a live AI model. Try one of the example questions." }]);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshStatus = useCallback(async () => {
    if (demoOnly) return; // Never call private backend endpoints in the public demo.
    try {
      const response = await fetch("/api/agent/status", { cache: "no-store" });
      const data = await response.json();
      setBackendRunning(data.status === "running");
      setStatus(data.agent || null);
    } catch {
      setBackendRunning(false);
      setStatus({ ready: false, provider: "unknown", message: "Could not check the Python service." });
    }
  }, [demoOnly]);

  useEffect(() => { if (!demoOnly) void refreshStatus(); }, [demoOnly, refreshStatus]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  async function ask(text: string) {
    const content = text.trim();
    if (!content || content.length > 500 || busy) return;
    setBusy(true);
    setQuestion("");
    setMessages(prev => [...prev, { id: nextId.current++, role: "user", text: content }]);
    // If the live backend is unavailable, answer supported questions locally.
    // This avoids a broken API request on Vercel, without falsely claiming AI ran.
    if (demoOnly || !backendRunning || !status?.ready) {
      setMessages(prev => [...prev, {
        id: nextId.current++, role: "assistant", source: "calculation", text: getDemoAnswer(content),
      }]);
      setBusy(false);
      return;
    }
    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-8).map(m => ({ role: m.role, text: m.text.slice(0, 500) })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Couldn't get an AI response. Check the backend terminal.");
      if (!["strands", "calculation"].includes(payload.mode) || typeof payload.answer !== "string") throw new Error("Unexpected agent response.");
      setMessages(prev => [...prev, {
        id: nextId.current++, role: "assistant", text: payload.answer,
        source: payload.mode === "calculation" ? "calculation" : "strands", tools: Array.isArray(payload.tools_used) ? payload.tools_used : [],
      }]);
    } catch {
      // Safe fallback if the optional backend drops during a session.
      setMessages(prev => [...prev, {
        id: nextId.current++, role: "assistant", source: "calculation",
        text: "The live AI service is unavailable. Here is a calculation from the fictional demo data instead:\n\n" + getDemoAnswer(content),
      }]);
      setBackendRunning(false);
    } finally {
      setBusy(false);
      if (!demoOnly) void refreshStatus();
    }
  }

  function previewCalculation() {
    const expense = 130_000;
    const result = simulateExpense(expense);
    setMessages(prev => [...prev,
      { id: nextId.current++, role: "user", text: "Preview: Can I afford a $1,300 car repair?" },
      { id: nextId.current++, role: "assistant", source: "preview",
        text: `Calculated preview (no AI): Starting with ${formatUSD(financials.checkingCents)} in checking, adding ${formatUSD(financials.incomeCents)} monthly income, and subtracting ${formatUSD(financials.expenseCents)} planned expenses gives ${formatUSD(result.baselineCents)}. After a ${formatUSD(expense)} repair, projected checking is ${formatUSD(result.revisedCents)}. That's ${formatUSD(result.shortfallCents)} below the ${formatUSD(result.bufferCents)} safety buffer. This is an illustrative one-month scenario, not a scheduled cash flow forecast.` },
    ]);
  }

  return (
    <AppShell current="assistant">
      <section className="page-heading">
        <div><p className="eyebrow">{demoOnly ? "INTERACTIVE BUDGET DEMO" : "FINANCIAL ASSISTANT"}</p><h1>Explore your budget<span className="period">.</span></h1>
          <p className="page-description">{demoOnly ? "Instant answers calculated from fictional sample data — no AI backend required." : "Explore fictional finances with an optional live agent and a calculation fallback."}</p></div>
        {!demoOnly && <button className="button button-outline" type="button" onClick={() => void refreshStatus()}>↻ Check connection</button>}
      </section>
      <div className="assistant-grid">
        <section className="panel assistant-chat" aria-label="AI assistant conversation">
          <div className="panel-heading assistant-header">
            <div><h2>MyPortfolio budget guide</h2><p>Fictional sample numbers · Read-only</p></div>
            <span className="agent-state agent-state-ready">
              <i aria-hidden="true" /> {demoOnly || !backendRunning || !status?.ready ? "Calculation demo · no AI" : "Strands configured"}
            </span>
          </div>
          <div className="chat-messages" ref={scrollRef} aria-live="polite" aria-relevant="additions text">
            {messages.map(msg => <div key={msg.id} className={`chat-row ${msg.role === "user" ? "chat-row-user" : ""}`}>
              <div className={`chat-icon ${msg.role === "user" ? "chat-icon-user" : ""}`}>{msg.role === "user" ? "A" : "✳"}</div>
              <div className="chat-message-content">
                <div className="chat-author">{msg.role === "user" ? "You" : "MyPortfolio"}{msg.source && <span className="chat-source">{msg.source === "strands" ? "Strands AI · verified amounts" : msg.source === "calculation" ? "Verified calculation · no AI" : "Calculation preview — no AI"}</span>}</div>
                <p className="chat-bubble">{msg.text}</p>
                {!!msg.tools?.length && <div className="tool-events"><strong>Tools called</strong>{msg.tools.map((tool, i) => <div key={`${tool.tool}-${i}`}><span aria-hidden="true">✓</span> <code>{tool.tool}</code> — {tool.description}</div>)}</div>}
              </div>
            </div>)}
            {busy && <p className="agent-thinking" role="status">{demoOnly || !backendRunning ? "Calculating…" : "Strands agent is working…"}</p>}
          </div>
          <form className="chat-input-row" onSubmit={e => { e.preventDefault(); void ask(question); }}>
            <label htmlFor="chat-question" className="sr-only">Ask a financial question</label>
            <input id="chat-question" type="text" autoComplete="off" placeholder="Ask about your budget or a what-if scenario…" value={question}
              maxLength={500} onChange={e => setQuestion(e.target.value)} disabled={busy}/>
            <button type="submit" className="button button-primary" disabled={busy || !question.trim()}>{busy ? "Working…" : demoOnly || !backendRunning || !status?.ready ? "Calculate ↗" : "Ask AI ↗"}</button>
          </form>
          <p className="chat-footnote">{demoOnly ? "Calculations run in your browser using fictional data. No AI or external financial connection is used." : "When a live AI service is configured, questions may be sent to its provider. Do not enter personal or financial information."}</p>
        </section>
        <aside className="assistant-side">
          {demoOnly ? <section className="panel assistant-status-panel">
            <div className="panel-heading"><div><h2>How this demo works</h2><p>Verified numbers · No AI dependency</p></div></div>
            <div className="agent-status-row"><span>Data</span><strong>Fictional profile</strong></div>
            <div className="agent-status-row"><span>Calculations</span><strong>In-browser</strong></div>
            <div className="agent-status-row"><span>Live AI</span><strong>Not enabled</strong></div>
            <p className="agent-status-message">Questions use the same sample financial data and calculation functions as the dashboard.</p>
            <p className="assistant-notice">This is a deterministic budget guide, not the Strands AI agent. The original backend integration remains in the source for future development.</p>
          </section> : <section className="panel assistant-status-panel">
            <div className="panel-heading"><div><h2>Optional AI connection</h2><p>Python FastAPI + Strands Agents SDK</p></div></div>
            <div className="agent-status-row"><span>Backend</span><strong>{backendRunning ? "Running" : "Not connected"}</strong></div>
            <div className="agent-status-row"><span>Mode</span><strong>{status?.ready && backendRunning ? "Strands configured" : "Local calculations"}</strong></div>
            <p className="agent-status-message">{status?.ready && backendRunning ? "An agent is configured; responses still depend on provider availability." : "The financial guide remains usable without a Python backend."}</p>
          </section>}
          <section className="panel assistant-examples">
            <div className="panel-heading"><div><h2>Try a calculation</h2><p>Built around Alex's fictional sample data</p></div></div>
            <div className="suggestion-list">{questions.map(text => <button key={text} disabled={busy} type="button" onClick={() => void ask(text)}>{text}<span aria-hidden="true">↗</span></button>)}</div>
          </section>
          <section className="panel assistant-preview">
            <h2>Explore a sample scenario</h2>
            <p>See how a one-time expense affects the demo balance. <strong>These are calculations, not AI responses.</strong></p>
            <button type="button" className="button button-outline" onClick={previewCalculation}>Preview the $1,300 calculation</button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
