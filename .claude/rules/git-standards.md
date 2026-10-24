## Git Standards

Use the following standards across all repositories:

- GitHub Flow for branch-based development.
- Conventional Commits 1.0.0 for commit messages.
- English for branch names and commit messages.
- Lowercase kebab-case for branch descriptions.

Branch naming format:

<type>/<issue-number>-<short-description>

Supported branch types:

- feat
- fix
- refactor
- docs
- chore

Commit format:

<type>(<scope>): <description>

Follow the Conventional Commits 1.0.0 specification.

Before development:

- Verify the working tree is safe.
- Update main using fast-forward-only pull.
- Create or reuse the task branch.
- Never overwrite uncommitted changes.

After development:

- Run relevant validations.
- Wait for explicit user approval.
- Create commits following Conventional Commits.
- Never push without authorization.
- Never merge into main automatically.
- Complete the GitHub task only after confirmed delivery.

Apply these rules consistently to frontend,
backend, and mobile repositories.
