# MyPortfolio — Five-Minute Hackathon Demo

**Say upfront:** "MyPortfolio is a local prototype using fictional financial data. It does not connect to banks, process payments, or provide tax or investment advice."

| Time | Screen | What to show and say |
|---|---|---|
| 0:00–0:45 | Dashboard (`/`) | "We combine checking, savings, and a monthly budget into one financial picture." Show checking **$1,200**, savings **$3,500**, income **$3,200**, expenses **$2,900**, and monthly surplus **$300**. |
| 0:45–1:45 | Simulator (`/simulator`) | "What happens if a car repair costs $1,300?" Enter **1300**. Expected projected checking **$200**, **$300 below** the **$500** buffer. |
| 1:45–3:15 | AI Assistant (`/assistant`) | Ask **"What is my monthly surplus?"** Show **get_demo_financial_overview** and its verified **$300** response. Then ask **"Can I afford a $1,300 car repair?"** Show **analyze_one_time_expense** and the verified **$200** projected checking balance. |
| 3:15–4:15 | Architecture | "Our Next.js frontend calls FastAPI, which uses Strands Agents SDK with locally hosted Ollama (Qwen2.5:3b). Strands invokes read-only calculation tools; Python owns all money arithmetic." Show tool names on screen. |
| 4:15–5:00 | Wrap-up | "This first version detects potential cash stress. Next we can add real data integrations, approvals, more agents, and secure hosting." Ask for judge questions. |

## Judge Q&A

**What makes it an agent rather than a chatbot?** Strands calls typed tools (`get_demo_financial_overview`, `analyze_one_time_expense`, `analyze_income_drop`) to access current application data and deterministic calculations. Check the tools-called panel.

**Why keep calculations in Python?** Small LLMs can misread cents/dollars. The application displays verified amounts from the calculation service, not unverified model arithmetic.

**Does it use real money?** No. All balances and activities are fictional. There is no login, bank connectivity, trading, or bill payment.

**What if AI fails live?** Use the what-if simulator, which doesn't need AI. The assistant may offer a visibly labeled calculation preview, but **never describe the preview as a Strands tool call**.

## Pre-demo checklist

- [ ] Plug in charger; disable sleep for demo duration
- [ ] Test Ollama Qwen2.5:3b before going on stage
- [ ] Start backend and website; verify `http://127.0.0.1:8000/api/health`
- [ ] Open `/`, `/simulator`, and `/assistant` ahead of time
- [ ] Ask exact questions and verify the **Tools called** panel
- [ ] Keep terminal available for troubleshooting but don't display secrets
- [ ] Have simulator ready as fallback
- [ ] State "fictional sample data" at the beginning
