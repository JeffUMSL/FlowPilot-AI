# MyPortfolio — Step 5: Run, Verify, and Present

> **Public portfolio update (October 2026):** `/demo/assistant` provides a login-free, backend-free financial calculation guide. It does **not** run AI or Strands; it uses fictional demo data. The original `/assistant` route retains an optional Strands integration and now falls back gracefully to calculations when the backend is disconnected. See `PUBLIC-DEMO-FIX.md`.

This is a **single, complete, consolidated project**, assembled from the original Step 3 release plus the reliability hotfix. You no longer need to copy separate repair ZIPs or merge `src` folders. It includes `package.json`, all pages, all Python backend files, Strands tools, the fictional demo data and tests. It does **not** contain your Ollama installation, Python packages, `node_modules`, `.venv`, or private `.env`.

## Install on Windows (first time only)

1. Extract this ZIP. Open the **inner `MyPortfolio-Step5-Demo-Ready` folder** (containing `package.json`) in VS Code.
2. In a terminal there, run `npm install`.
3. Create local backend config: `Copy-Item .\backend\.env.example .\backend\.env`.
4. Verify that Ollama is installed and the small model exists: `ollama list` (if missing: `ollama pull qwen2.5:3b`).
5. Install Python dependencies **from the backend folder**:

   ```powershell
   cd backend
   python -m pip install -r requirements-ollama.txt
   cd ..
   ```

   To isolate dependencies, you may use `py -m venv .venv` in `backend` and run `.\.venv\Scripts\python.exe -m pip install -r requirements-ollama.txt` instead; then use that Python when starting the backend.

## Launch on demo day

- Double-click **`LAUNCH-DEMO.cmd`** to open website/backend terminals, or run commands manually:

  **Terminal A, from the project root:** `npm run dev`

  **Terminal B, from `backend/`:** `python -m uvicorn app:app --host 127.0.0.1 --port 8000`

- Ollama should be running locally. Verify with `ollama list`.
- Open `http://localhost:3000`. Also open `http://localhost:3000/simulator` and `http://localhost:3000/assistant`.
- Check backend: `http://127.0.0.1:8000/api/health`. Expect provider `ollama` and `ready: true` (configuration only; actual agent call still needs testing).
- Check frontend proxy: `http://localhost:3000/api/agent/status`.
- Optional check: `powershell -NoProfile -ExecutionPolicy Bypass -File .\VERIFY-DEMO.ps1`.
- Run `TEST-DEMO.cmd` before the event for calculation-unit tests; then test real browser interactions.

## Four manual acceptance checks

1. Homepage: income **$3,200**, expenses **$2,900**, monthly surplus **$300**.
2. Simulator: **$1,300** one-time expense -> projected checking **$200**, **$300 below** **$500** buffer.
3. Ask "What is my monthly surplus?" -> **$300**, with `get_demo_financial_overview` in the **Tools called** panel. If the answer is labeled **Verified calculation · no AI**, say exactly that rather than claiming an agent executed a tool.
4. Ask "Can I afford a $1,300 car repair?" -> projected checking **$200**, with `analyze_one_time_expense` when Strands successfully calls it.

## Presentation and hosting

- See `DEMO-SCRIPT.md` for a rehearsable 5-minute presentation.
- See `DEPLOYMENT-NOTES.md` for local launch vs public deployment.
- The current prototype is **not safe for internet-facing production hosting**. It uses only fictional data, no authentication, and no money movement. Keep it local for now.

## Migrating from your working Step 3 project

**Don't replace your existing project.** This ZIP is a separate clean copy so the old project remains a fallback. If you already have a working `backend/.env` with Ollama, you may manually copy only that file into this new project's `backend` folder instead of creating it from `.env.example`. Never send or upload the `.env` file.

## Common troubleshooting

- **`next` not recognized:** Run `npm install` in the folder containing `package.json`.
- **404 on homepage:** Ensure `app/page.tsx` and `app/layout.tsx` exist in the same project root as `package.json`.
- **Cannot import app/agent_service/finance:** Run Python from `backend/`. All 3 source files are included.
- **`No module named ollama`:** Run `python -m pip install -r requirements-ollama.txt` using the same interpreter that runs Uvicorn.
- **`provider`: `openai` despite Ollama:** Check `backend/.env` and any system environment variable `STRANDS_PROVIDER` that may override it.
- **AI loading forever:** Check the FastAPI terminal, confirm Ollama has Qwen2.5:3b, and try the same prompt again.
- **Multiple lockfiles warning:** Open the inner project folder in VS Code; don't run `npm install` at an outer extraction directory.
