---
name: next-task
description: Pick the highest-priority eligible Ready task from the GitHub Project, enforce WIP limits, assign it to me, move it to In Progress and implement it. Optional args are area/project in natural language (e.g. "frontend", "backend api", "frontend app").
argument-hint: "[area] [project]"
disable-model-invocation: true
---

Read `.claude/rules/task-execution.md` and follow it exactly (selection, WIP, assignment, execution, after implementation).

Arguments (natural language, may be empty): $ARGUMENTS

Steps:
1. Parse arguments into filters: area (`frontend`, `backend`, `fullstack`, `infra`) and/or project (`app` etc.). Ask if a project name is ambiguous.
2. Fetch Ready items from project `vinimw/projects/2`; apply filters; check WIP on In Progress items. If the scope is occupied, show the active task, offer to continue it, and stop.
3. Select by Priority, then oldest. Assign to me, set In Progress, verify both.
4. Read the issue, implement, validate.
5. Keep In Progress; no commit/push/Done. Report in Portuguese and wait for validation.
