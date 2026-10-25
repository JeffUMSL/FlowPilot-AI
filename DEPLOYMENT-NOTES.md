# Step 5: What "launch" means for this local AI version

## Hackathon launch — supported approach

Use the project locally with **two processes** on your Windows PC:

- Next.js at `http://localhost:3000`
- FastAPI at `http://127.0.0.1:8000`
- Ollama at `http://127.0.0.1:11434` (Qwen2.5:3b)

This is a **local demonstration**, not a publicly accessible web deployment.

## Important limitation for public deployment

Do **not** deploy only the frontend to Vercel and assume the AI will work remotely. The Next.js API routes use `AI_BACKEND_URL` (default `http://127.0.0.1:8000`), and the hosted server cannot reach the FastAPI/Ollama services running on your personal computer.

**Do not publish the current FastAPI backend directly to the internet.** It has no user login, rate-limiting, production isolation, secret management or abuse protections. Do not expose Ollama's local API publicly. Keep personal and financial data out of the prototype.

## Path to a public version — later

1. Deploy Next.js to a supported frontend provider.
2. Deploy the FastAPI backend on a securely configured Python/container host.
3. Choose a hosted LLM service for public AI, or an appropriately secured and provisioned model server. Local Ollama on an 8 GB PC is not a sensible public inference host.
4. Set the **server-side** `AI_BACKEND_URL` for Next.js to the HTTPS API host; keep credentials in backend server secrets.
5. Add authentication, per-user access control, request limits, strict CORS/proxy rules, monitoring, and privacy controls.
6. Test fully deployed AI from another device and fix outstanding security and reliability issues before sharing a link.

The existing frontend can be shared **as a visual demo only**, but its AI features should be labeled unavailable unless the backend and model are truly deployed.
