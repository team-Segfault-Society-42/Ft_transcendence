# Contributing to Ft_transcendence

Thank you for contributing to **Ft_transcendence**.

This repository is maintained by a team of five students as part of the 42 school project.
To keep the project clean, understandable, and easy to review, please follow the guidelines below.

## Project Context

Ft_transcendence is a collaborative study project developed by our team at 42.

Current stack:
- Frontend: React + TypeScript + Vite
- Backend: NestJS
- Database: PostgreSQL
- Reverse proxy: Nginx
- Environment: Docker Compose

## Branching Strategy

We use the following branch structure:

- `main` → stable release branch
- `dev` → main development branch
- `feature/*` → new features
- `fix/*` → bug fixes
- `chore/*` → maintenance, cleanup, tooling, or documentation

Unless the team decides otherwise, always create your branch from `dev`.

## Recommended Workflow

1. Open or assign an issue.
2. Create a dedicated branch from `dev`.
3. Make small and clear commits.
4. Test your changes locally.
5. Open a pull request targeting `dev`.
6. Request at least one review.
7. Merge only after approval and validation.

## Commit Messages

Use clear and consistent commit messages whenever possible.

Recommended format:

`type(scope): short description`

Examples:
- `feat(auth): add jwt auth guard`
- `fix(frontend): correct profile loading`
- `chore(repo): update github templates`
- `docs(readme): clarify setup steps`

## Pull Requests

A pull request should:
- have a clear title
- stay focused on one topic when possible
- reference the related issue if relevant
- explain what was changed
- explain how it was tested

Before opening a PR, make sure:
- the project still builds correctly
- your feature or fix works locally
- no secret or sensitive file has been committed
- documentation is updated if needed

## Testing Expectations

Before asking for a review, test your work as much as possible.

Examples:
- verify frontend behavior manually
- test backend endpoints and returned status codes
- check that Docker services still build and run
- confirm frontend and backend integration still works

If useful, include short test steps in the PR description.

## Security and Sensitive Files

Never commit:
- `.env` files
- passwords
- API keys
- tokens
- certificates
- private credentials
- any other sensitive configuration data

Use environment variables and keep sensitive files out of version control.

## Code Review Guidelines

Code reviews are meant to improve the project.

When reviewing:
- be respectful
- be precise
- explain blocking issues clearly
- separate required changes from optional suggestions

When receiving feedback:
- stay open to discussion
- do not take comments personally
- ask for clarification if something is unclear
- update the PR cleanly

## Documentation

If your change affects setup, usage, architecture, workflow, or testing, update the related documentation.

## General Goal

The goal is not only to make the code work, but also to keep the project clean, understandable, and maintainable for the whole team.
