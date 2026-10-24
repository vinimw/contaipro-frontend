---
name: finish-task
description: Finalize the current active task after my explicit approval - verify implementation and commit/push status, then move it to Done and close the issue.
argument-hint: "[issue number]"
disable-model-invocation: true
---

Read `.claude/rules/task-execution.md` (Approval and completion) and follow it.

Arguments (optional issue number): $ARGUMENTS

Steps:
1. Identify the active task (argument, conversation, or In Progress tasks assigned to me; ask if several).
2. Confirm I have explicitly approved it. If not, ask; never finalize an unapproved task.
3. Verify implementation is complete, validations passed, and check `git status` / unpushed commits.
4. If a commit or push is pending: report it, keep In Progress, and stop. Never commit or push automatically.
5. Once delivery is confirmed: set Status = Done, close the issue as completed, verify both, and return the issue URL with a short Portuguese summary.
