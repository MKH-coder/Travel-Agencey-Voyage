# Execution Scripts (Layer 3: Doing the work)

This directory contains deterministic, automated scripts called during directive execution.

## Design Guidelines

1. **Deterministic & Fast**: Scripts should run predictably and exit with appropriate status codes (`0` for success, non-zero for failure).
2. **Environment Aware**: Scripts should load credentials from `.env` using standard practices.
3. **No Secrets in Code**: Never commit hardcoded tokens or passwords in scripts.

## Scripts Index

- [`verify_env.js`](./verify_env.js): Compares local `.env` against `.env.example` and warns about missing variables.
