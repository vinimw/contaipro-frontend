---
name: task-status
description: Read-only report of the GitHub Project - active tasks, tasks by project/area, Ready queue by priority, and WIP conflicts.
disable-model-invocation: true
allowed-tools: Bash(gh project item-list:*), Bash(gh project field-list:*), Bash(gh issue view:*), Bash(gh issue list:*), Bash(gh auth status:*)
---

Read `.claude/rules/task-execution.md`. Do not modify anything in GitHub or the repo.

Fetch items from project `vinimw/projects/2` and report concisely in Portuguese:
- Tasks In Progress (assignee, area, priority)
- Tasks grouped by repository/project and area
- Ready queue ordered by priority (then oldest), marking the next candidate
- WIP conflicts (more than one In Progress per scope; `fullstack` counts for frontend and backend)

The project has no Sprint field; omit Sprint information and say so only if asked.
