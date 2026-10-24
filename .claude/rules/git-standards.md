## Git Standards

Use the following standards across all repositories:

- GitHub Flow for branch-based development.
- Conventional Commits 1.0.0 for commit messages.
- English for branch names, commits, and Pull Request titles.
- Lowercase kebab-case for branch descriptions.

### Branch Naming

Format:

`<type>/<issue-number>-<short-description>`

Supported branch types:

- `feat`
- `fix`
- `refactor`
- `docs`
- `chore`

Examples:

- `feat/123-user-authentication`
- `fix/124-login-validation`
- `refactor/125-api-service`

### Commit Convention

Format:

`<type>(<scope>): <description>`

Follow the Conventional Commits 1.0.0 specification.

Examples:

- `feat(auth): implement refresh token`
- `fix(login): resolve validation error`
- `refactor(api): simplify request handling`
- `chore(deps): update dependencies`

Use concise, descriptive commit messages in English.

### Before Development

1. Identify the correct repository and GitHub issue.
2. Verify the current branch and working tree.
3. Never overwrite or discard uncommitted changes.
4. Fetch the latest changes from the remote repository.
5. Switch to `main` when safe.
6. Update `main` using `git pull --ff-only origin main`.
7. Create or reuse a dedicated task branch following the naming convention.
8. Never create duplicate branches for the same task.
9. Move the GitHub Project task to `In Progress`, if not already there.
10. Begin implementation.

If Git preparation cannot be completed safely, stop and report the issue.

### After Development — Automatic Delivery

When implementation is complete:

1. Run relevant automated tests.
2. Run lint, type checking, and build when applicable.
3. Review all modified files and the Git diff.
4. Verify that no unrelated changes, secrets, or sensitive files are included.
5. Stage only files related to the task.
6. **Automatically create a commit following Conventional Commits.**
7. **Automatically push the task branch to the remote repository.**
8. **Automatically create a Pull Request targeting `main`.**
9. Link the Pull Request to the corresponding GitHub issue.
10. Return the Pull Request URL and implementation summary.

**Do not wait for user approval before committing, pushing, or opening the Pull Request.**

These operations are part of the standard task execution workflow.

If validations fail, attempt to resolve the issues. If unresolved, report the failures and do not claim the implementation is complete.

### Pull Request Standards

PR titles must follow Conventional Commits.

Example:

`feat(auth): implement refresh token`

PR descriptions must be concise and follow this template:

**Resumo**

- Brief explanation of implemented changes.

**Validação**

- Tests executed and their results.
- Build and lint status, when applicable.

**Issue relacionada**

- `Refs #123`

Do not add automatic issue-closing keywords before the implementation is approved.

### Corrections After PR Creation

If I request changes after reviewing or testing the implementation:

1. Keep the task in `In Progress`.
2. Reuse the same branch.
3. Apply the requested corrections.
4. Run relevant validations again.
5. Automatically create additional Conventional Commits.
6. Automatically push the corrections.
7. Reuse the existing Pull Request.
8. Do not create duplicate Pull Requests.

Do not require approval for commits or pushes related to requested corrections.

### Task Completion

Creating a commit, pushing code, or opening a Pull Request does not mean the task is completed.

After opening the PR:

- Keep the GitHub Project task in `In Progress`.
- Keep the GitHub issue open.
- Wait for my manual validation and approval.
- Never merge the Pull Request automatically.
- Never mark a task `Done` without my approval.

After I explicitly approve the task:

1. Confirm that the Pull Request is ready for integration.
2. Wait for the PR to be merged by me, unless I explicitly authorize Claude to merge it.
3. Verify the PR was successfully merged into `main`.
4. Move the GitHub Project task to `Done`.
5. Close the GitHub issue as completed if it remains open.
6. Confirm completion.

### Safety Rules

- Never force-push automatically.
- Never perform destructive Git operations.
- Never overwrite unrelated changes.
- Never commit credentials or secrets.
- Never merge into `main` without explicit authorization.
- Never close an issue just because a PR was opened.
- Never mark incomplete work as `Done`.

Apply these rules consistently to frontend, backend, and mobile repositories.
