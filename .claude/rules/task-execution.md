# Task Execution Rules (GitHub Projects)

Complements `github-tasks.md` (task creation). Applies when I ask to pick, continue, finish or inspect tasks.

## Context (verify with `gh` before mutating; never assume a mutation worked)

- Account: `gh auth status` (currently `vinimw`)
- Repository: `vinimw/contaipro-frontend`
- Project: `contai-pro` (owner `vinimw`, number `2`)
- Fields: `Status` (Backlog, Ready, In Progress, Done), `Priority` (Critical, High, Medium, Low), `Size` (XS–XL)
- Area/type come from issue labels: `app`, `frontend`, `backend`, `fullstack`, `infra`, `feature`, `chore`, `refactor`, `spike`, `epic`, `bug`
- No Sprint, Target date or Type project fields exist. Do not create them and do not use Sprint criteria.
- Fetch IDs dynamically: `gh project field-list 2 --owner vinimw --format json`, `gh project item-list 2 --owner vinimw --format json -L 200`. Update with `gh project item-edit`; assign with `gh issue edit <n> --add-assignee @me`.
- Project name -> repo mapping: only via existing metadata. `App` means label `app`. Never invent mappings; ask if ambiguous.

## Workflow

Statuses are exactly Backlog → Ready → In Progress → Done. Review/testing happen in In Progress.
The GitHub Project is the source of truth for task state; the repository for implementation state.

## Selection ("Pegue a próxima task")

1. List items with Status = Ready; apply requested filters (area label, `app`, etc.). Tasks lacking the filtered label are excluded only by that filter; an unrequested area never excludes a task.
2. Check WIP (below).
3. Sort by Priority: Critical > High > Medium > Low > no priority. Never invent a priority.
4. Ties: oldest created issue first.
5. Assign to the authenticated user (add; keep existing assignees), set Status = In Progress, re-read to verify both. Report failures; never claim success unverified.
6. Read the full issue, inspect the repo, follow conventions (and `AGENTS.md`), implement, update tests when appropriate, run available validations (lint, typecheck, build/tests from package.json), review the diff.

## WIP limit

Max ONE In Progress task per repository/project + primary area (frontend, backend, fullstack, infra). `fullstack` occupies both frontend and backend. Different projects/repos never block each other. If the scope is occupied: do not start or move anything; show the active task and offer to continue it. Never override silently.

## After implementation

- Keep Status = In Progress. Do NOT commit, push, close the issue, mark Done, or start another task.
- Summarize in Portuguese: task, main changes, tests run, validation results, manual test suggestions, known limitations. Then wait.
- Feedback/problems: keep In Progress, fix, re-test, report, wait again. Same task, no new issue unless the scope is genuinely separate.

## Approval and completion

On explicit approval ("Está aprovado", "Tudo certo", "Pode finalizar essa task"):
1. Identify the active task (from context; else In Progress tasks assigned to me; ask if several).
2. Verify implementation complete and validations passed.
3. Check `git status`/`git log`/upstream for pending commit or push.
4. If delivery is pending: say so, keep In Progress. Never commit/push on my own.
5. After I confirm delivery: set Status = Done, close the issue as completed (`gh issue close <n> --reason completed`), verify, return URL and summary.
Canceled/abandoned tasks are never marked Done.

## Resume ("Continue a task")

Find In Progress tasks matching filters, read the issue and `git status`/`git diff`, continue. Never pick a new Ready task for this. Ask if several match.

## Safety

Check current status before every transition; avoid duplicate transitions; do not touch unrelated items. A passing build is not approval.
