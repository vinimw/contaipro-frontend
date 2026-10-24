# Configure GitHub Task Management Instructions

The project is in vinimw/projects/2/views/1

Act as a Senior Software Engineer and GitHub Projects Automation Specialist.

I want you to establish permanent task management instructions for this project using Claude Code's instruction files.

These rules must be applied whenever I ask you to create, organize, update, prioritize, or plan development tasks in GitHub Projects.

## 1. Instruction Files

Inspect the existing `CLAUDE.md` before making changes.

Create the following file:

`.claude/rules/github-tasks.md`

This file must contain the permanent GitHub task management rules described below.

Update `CLAUDE.md` to reference the task management rules using a supported instruction import, without overwriting existing content.

Do not duplicate the entire rules file inside `CLAUDE.md`.

## 2. Task Classification

Every new task should have the following classifications.

### Area

Use GitHub issue labels:

- `app` — For all tasks inside app.
- `frontend` — UI, components, styles, frontend state, client-side logic.
- `backend` — APIs, services, authentication, database, server-side logic.
- `fullstack` — Work that involves both frontend and backend.
- `infra` — Infrastructure, deployment, CI/CD, Docker, monitoring.

Only assign one primary area label.

Infer the area from the task description whenever possible.

### Priority

Use the existing GitHub Project Priority field:

- `Critical` — Production blockers, severe security issues, critical failures.
- `High` — Important features, significant bugs, urgent improvements.
- `Medium` — Regular development tasks.
- `Low` — Minor improvements, optional enhancements, cleanup.

Default priority: `Medium`.

Do not automatically classify a task as Critical without a clear reason.

### Type

Use the existing project Type field where possible, and maintain compatible issue labels if needed:

- `Feature` — New functionality.
- `Bug` — Fix unexpected behavior.
- `Chore` — Maintenance or configuration.
- `Refactor` — Code improvements without intended behavioral changes.
- `Spike` — Technical investigation or research.
- `Epic` — Larger initiative containing multiple tasks.

Preserve any existing Task type where already configured.

Do not recreate existing labels or fields unnecessarily.

### Size

Use a GitHub Project single-select field called `Size`, if supported.

Values:

- `XS` — Very small change.
- `S` — Small change.
- `M` — Moderate change.
- `L` — Large change.
- `XL` — Very large change that should be considered for decomposition.

Size is optional.

Do not invent precise time estimates.

## 3. Task Naming Convention

Use concise, descriptive titles in Brazilian Portuguese.

Examples:

- Implementar autenticação com refresh token
- Criar componente de paginação
- Corrigir validação do formulário
- Refatorar serviço de usuários
- Configurar pipeline de deploy

Avoid generic titles such as:

- Fix bug
- Update code
- Improve backend
- New feature

Do not add area, priority, status, or type prefixes to titles because these attributes already exist in GitHub metadata.

## 4. Task Description Template

All tasks should follow this lightweight Markdown structure:

### Descrição

A short explanation of what needs to be done, ideally one or two sentences.

### Checklist

Include two to four actionable implementation items only when they help clarify the work.

Example:

**Title:** Implementar refresh token na autenticação

**Descrição**

Adicionar renovação de access token utilizando refresh token para manter a sessão autenticada.

**Checklist**

- [ ] Criar endpoint de renovação
- [ ] Validar refresh token
- [ ] Tratar expiração e erros

Do not add sections for:

- Business justification
- Extensive technical analysis
- Detailed acceptance criteria
- Long implementation plans
- Definition of Done
- Repeated project metadata

Only add additional details when necessary to avoid ambiguity.

For extremely simple tasks, the description alone is sufficient.

## 5. Task Creation Behavior

Whenever I ask you to create a task:

1. Understand the requested work.
2. Identify the correct GitHub repository and project.
3. Check for existing similar open issues.
4. Infer Area, Type, and Priority.
5. Infer Size only when reasonable.
6. Generate a concise title.
7. Generate the simplified description.
8. Create the GitHub issue.
9. Add the appropriate labels.
10. Add the issue to the GitHub Project.
11. Configure its project fields.
12. Return the created issue URL.

If a very similar issue already exists, do not create a duplicate automatically. Show the existing issue and suggest updating it.

Do not ask for confirmation when the request is sufficiently clear and only involves creating a new task.

Ask a question only when essential information is missing.

Never invent requirements that were not provided.

## 6. Default Values

For new tasks:

- Status: `Backlog`
- Priority: `Medium`
- Assignee: Unassigned, unless explicitly provided
- Area: Automatically inferred
- Type: Automatically inferred
- Size: Optional

When I explicitly specify status, priority, or assignee, use my values instead of the defaults.

## 7. Continuous Flow (No Sprints)

The project does not use Sprints or time-boxed iterations. Work flows continuously through the Kanban board.

Do not create Sprint or iteration fields, and do not mention Sprints in tasks.

When I ask what to work on next:

- Review tasks in Backlog and Ready.
- Consider priority and estimated size.
- Suggest which tasks should move to Ready or In Progress.
- Do not change statuses until I approve the suggestion.

## 8. Task Breakdown

Avoid creating unnecessarily large or overly granular tasks.

Prefer tasks that represent one coherent piece of development work.

For a large feature:

- Recommend dividing it into smaller tasks.
- Group related tasks under a parent issue or Epic when appropriate and supported.
- Avoid creating excessive subtasks.
- Do not split work without a clear benefit.

When I explicitly ask you to break down a feature, propose the tasks before creating them unless I authorize immediate creation.

## 9. Kanban Workflow

Use exactly these statuses:

Backlog → Ready → In Progress → Done

Code review and testing happen during In Progress.

Do not introduce separate Review or Testing statuses.

Only mark a task Done when its intended work is complete.

Do not move unrelated issues as side effects.

## 10. Language and Communication

Use Brazilian Portuguese for task titles, descriptions, and checklists.

Keep technical terminology in English when appropriate.

Task descriptions should be concise, practical, and focused on implementation.

Avoid corporate project-management language and unnecessary documentation.

This project is primarily managed by one developer.

Optimize for speed, clarity, and low maintenance overhead.

## 11. GitHub Synchronization

Before creating or updating GitHub issues:

- Verify the authenticated account and relevant repository.
- Identify the intended GitHub Project.
- Reuse existing fields and labels.
- Avoid duplicates.
- Respect existing issue relationships.
- Use available GitHub integration, CLI, or API capabilities.
- Verify successful changes before reporting completion.

If a particular operation is unavailable, explain the limitation instead of reporting success.

Do not change repository code when I only request task management.

## 12. Examples of User Requests

These commands should be understood naturally:

"Crie uma task backend para implementar JWT, prioridade alta."

"Adicione uma task frontend para melhorar a responsividade."

"Crie um bug para corrigir o problema de login."

"Mostre as tasks de prioridade alta no backlog."

"Mova a task 42 para Ready."

"Sugira as próximas tasks a trabalhar com base na prioridade."

"Divida a funcionalidade de notificações em tasks menores."

"Marque a task 18 como Done."

## 13. Setup and Validation

Apply the following changes:

1. Inspect existing Claude instruction files.
2. Create or update `.claude/rules/github-tasks.md`.
3. Reference these instructions from `CLAUDE.md`.
4. Inspect existing GitHub Projects fields.
5. Create or reuse the necessary Area, Priority, Type, and Size classifications.
6. Create missing area and type issue labels only where appropriate.
7. Preserve the existing Kanban structure.
8. Verify that the task creation workflow is ready.

Do not create test issues or example tasks in GitHub.

Do not modify source code.

After completing the configuration, provide a short summary of the instruction files created, GitHub classifications configured, and any remaining limitations.
