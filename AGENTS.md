# AGENTS.md

## Cursor Cloud specific instructions

### Product

**NeuralForge** is the runnable app in this repo: a Next.js 16 AI image/video studio (`src/`). Image generation uses Pollinations (no API key). Video modes can use Replicate, Fal.ai, Pollinations, or in-browser motion encoding. The `skills/` tree is a separate agent-skill library and is not required to run the main UI.

### Required service (default E2E)

| Service | Port | Command |
|---------|------|---------|
| Next.js dev server | 3000 | `npm run dev` |

Outbound HTTPS to Pollinations (and optionally Replicate/Fal) is required for real generations. There is no docker-compose stack and no database used by the app (`.env` `DATABASE_URL` is unused).

### Optional (not wired into current frontend)

- **Python backend** (`neuralforge-backend/`, port 5000): `pip install -r requirements.txt` then `python main.py` — documented in README but the UI store defaults to cloud mode.
- **ZAI proxy** (`proxy/server.js`, port 3456): only relevant for `skills/` scripts using `z-ai-web-dev-sdk`.

### Lint / typecheck / build

See `package.json` scripts. **Note:** `npm run lint` (`next lint`) fails on Next.js 16.1.x in this repo (`Invalid project directory .../lint`) because the CLI no longer exposes a `lint` subcommand. Use `npx tsc --noEmit` for typechecking (expect some errors under `skills/` and a few in `src/` that do not block `next build`). Production build: `npm run build`.

### Dev server

- Start in a persistent tmux session if you need background: `npm run dev` (Turbopack).
- Health check: `GET http://localhost:3000/api/health`
- Image hello-world API: `POST http://localhost:3000/api/generate/image` with JSON `{"prompt":"..."}`

### Gotchas

- Do not assume hot reload picks up all `node_modules` changes; restart `npm run dev` after major dependency updates.
- Full-repo `tsc` includes `skills/**` TypeScript files; narrowing checks to `src/` avoids unrelated skill errors if needed.
