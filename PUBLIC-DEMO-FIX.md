# Public demo assistant — October 25, 2026

## Why the old error occurred

The deployed Next.js route `/api/agent/chat` tried to call `http://127.0.0.1:8000`, the developer's local FastAPI server. Vercel cannot access that server, so the chat showed “Cannot reach the Python backend.”

## What changed

- Added `/demo/assistant`: a **public, read-only calculation guide** with no backend requests and no sign-in requirement under the existing middleware.
- Updated both sidebar and mobile navigation to link to `/demo/assistant` instead of the protected `/assistant` page.
- The guide answers example budget questions using `lib/finance.ts` and `data/demo-data.json`, transparently labeled **not live AI**.
- Updated `/assistant` to gracefully fall back to these calculations when the optional AI backend is disconnected, rather than displaying raw connection errors.
- The original FastAPI/Strands routes and Python source are preserved, not publicly exposed or falsely claimed operational.

## Publish to your existing Vercel project

1. Make a backup of your GitHub FlowPilot-AI repository or create a new branch.
2. Replace/add the changed files in the existing GitHub repository, preserving the directory structure. Commit to `main` to trigger the Vercel deployment.
3. Check Vercel's deployment status is **Ready**.
4. In an Incognito window, test:
   - `https://flowpilot-ai-delta.vercel.app/demo` — no login; sample dashboard
   - `https://flowpilot-ai-delta.vercel.app/demo/simulator` — no login; interactive scenario
   - `https://flowpilot-ai-delta.vercel.app/demo/assistant` — no login; interactive calculations, no Python backend needed
5. Ask “What is my monthly surplus?” (should calculate **$300**). Then ask “Can I afford a $1,300 car repair?” (should calculate **$200** projected checking, **$300 below** the buffer).
6. Check navigation on both desktop and mobile and do not submit any real financial information.

### Changed/additional files

- `components/Assistant.tsx` (fallback and public demo mode)
- `components/AppShell.tsx` (public navigation and labeling)
- `lib/demo-assistant.ts` (new deterministic helper)
- `app/demo/assistant/page.tsx` (new public page)

No changes to `middleware.ts`, `vercel.json`, or authentication secrets are needed. The existing middleware allows all `/demo` routes to be public. The protected `/assistant` and `/api/agent/*` remain protected.

**Important:** Do not describe these local answers as Strands-powered AI. The local Python Strands workflow requires backend hosting and a supported model if you want a public interactive LLM later.
