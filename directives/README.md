# Directives (Layer 1: What to do)

This directory contains Standard Operating Procedures (SOPs) for development, deployment, database maintenance, and feature workflows in the **Travel-Agencey-Voyage** platform.

## Directive Structure

Every directive should outline:
1. **Objective**: What the task or workflow aims to achieve.
2. **Prerequisites & Inputs**: Required environment variables, configurations, or data files.
3. **Execution Steps**: Deterministic scripts to run from `execution/` or standard `npm` commands.
4. **Expected Output & Verification**: How to confirm success (e.g. HTTP status codes, build logs, UI checks).
5. **Edge Cases & Troubleshooting**: Known limitations, timeout handling, and common pitfalls.

## Available Directives

- [`development_workflow.md`](./development_workflow.md): Standard developer cycle for running dev server, linting, and building.
