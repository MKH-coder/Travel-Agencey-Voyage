# Directive: Development & Verification Workflow

## Objective
Provide a reliable procedure for running the Travel-Agencey-Voyage application locally, performing type safety checks, and validating production builds.

## Inputs & Environment
- Node.js / Bun runtime
- Environment file `.env` containing Supabase and Gmail configuration (see `.env.example`)

## Execution Procedure

1. **Verify Environment Variables**:
   ```bash
   node execution/verify_env.js
   ```

2. **Run Type-check & Linting**:
   ```bash
   npm run lint
   ```
   *Expected result*: No TypeScript errors (`tsc --noEmit` exits with 0).

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   *Expected result*: Server starts on port 3000 with Vite HMR active.

4. **Verify Production Bundle**:
   ```bash
   npm run build
   ```
   *Expected result*: `dist/` directory generated with client assets and `dist/server.cjs`.

## Troubleshooting & Self-Annealing
- **Missing Environment Variables**: Copy `.env.example` to `.env` and fill in necessary keys.
- **Port 3000 in use**: Check running processes on port 3000 (`lsof -i :3000`) before starting dev server.
