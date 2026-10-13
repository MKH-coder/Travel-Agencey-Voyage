# GEMINI.md - GitHub & Agentic Architecture Configuration

**Repository**: [MKH-coder/Travel-Agencey-Voyage](https://github.com/MKH-coder/Travel-Agencey-Voyage)  
**Primary Branch**: `main`  
**Application**: Travel Agency & Voyage Platform (Interactive travel bookings, AI trip planner, gamified exploration, admin telemetry & live support)

---

## Tech Stack Overview

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion, Lucide Icons, Leaflet, Recharts, jsPDF
- **Backend**: Express (Node.js via `tsx`), Vite SSR middleware, Nodemailer
- **AI & Integrations**: Google Gemini API (`@google/genai`), Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Firebase
- **Primary Entry Points**:
  - Dev / Production Server: `server.ts`
  - Frontend Client: `src/main.tsx` & `src/App.tsx`
  - Database & Security: `server/db.ts`, `server/security.ts`, `server/supabase.ts`

---

## The 3-Layer Architecture

You operate within a 3-layer architecture that separates concerns to maximize reliability, transparency, and efficiency when developing and maintaining this repository:

### Layer 1: Directive (What to do)
- **Location**: `directives/`
- **Purpose**: Standard Operating Procedures (SOPs) written in Markdown defining what needs to be achieved.
- **Contents**: Task objectives, inputs, relevant tools/scripts to call, expected outputs, testing criteria, and edge cases.
- **Style**: Clear, declarative instructions guiding both AI agents and human contributors.

### Layer 2: Orchestration (Decision making)
- **Role**: AI Agent & Developer Pair Programming glue.
- **Purpose**: Intelligent routing, workflow coordination, and context handling.
- **Contents**: Read active directives from `directives/`, invoke scripts from `execution/` in proper order, inspect errors, and verify results.
- **Style**: Avoid performing heavy, brittle programmatic transformations in chat when deterministic scripts can be used or created.

### Layer 3: Execution (Doing the work)
- **Location**: `execution/`
- **Purpose**: Deterministic, reproducible scripts and utilities (TypeScript/JavaScript/Shell).
- **Contents**: Database operations, migration runners, API testing, health checks, build verification, and deployment helpers.
- **Style**: Resilient, modular scripts reading credentials from `.env` without hardcoding sensitive secrets.

---

## Operating Principles

1. **Check for existing tools first**:
   Before writing a one-off command or script, check `execution/` and `package.json` scripts. Only create new scripts if a suitable one does not already exist.
2. **Self-anneal when things break**:
   - Inspect error output, logs, and stack traces thoroughly.
   - Fix the script or component and test again.
   - Update the corresponding directive with learned constraints (rate limits, schema specifics, edge cases).
3. **Keep Directives living and updated**:
   When new endpoints, features, or environment variables are introduced, update the respective SOP in `directives/`.
4. **Security & Secrets**:
   - Never commit `.env` or sensitive API keys (Supabase secrets, Gemini keys, Gmail SMTP credentials).
   - Use `.env.example` as the canonical template for required environment variables.

---

## Development & Build Commands

- **Development Server**: `npm run dev` (starts Express + Vite on port 3000 via `tsx server.ts`)
- **Type Checking / Lint**: `npm run lint` (`tsc --noEmit`)
- **Production Build**: `npm run build` (builds Vite client and bundles `server.ts` to `dist/server.cjs`)
- **Start Production**: `npm start` (`node dist/server.cjs`)
- **Deploy Frontend**: `npm run deploy` (`gh-pages -d dist --dotfiles`)

---

## GitHub & Agentic Workflow

- **Issues & PRs**: Reference the relevant SOPs from `directives/` when creating or addressing pull requests and issues.
- **CI / Automated Checks**: Ensure linting (`npm run lint`) and build (`npm run build`) pass before opening PRs to `main`.