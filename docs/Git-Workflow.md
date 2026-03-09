# Professional Git Workflow
## Branch model
```text
main  -> stable / production-ready
dev   -> integration branch
feature/* -> individual work branches
```
Example:
```text
main
  \
   dev
     ├── feature/frontend-login
     ├── feature/backend-hello
     └── feature/docker-setup
```
## Mandatory Workflow
### 1. Update `dev`
Always start from the integration branch, not directly from `main`.
```bash
git switch dev
git pull origin dev
```
### 2. Create a feature branch from `dev`
```bash
git switch -c feature/my-feature
```
This means:
```text
main
  \
   dev
     \
      feature/my-feature
```
### 3. Work in small logical commits
Check changes:
```bash
git status
```
Add files:
```bash
git add .
```
or more precisely:
```bash
git add filename
```
## 3.1 Commit changes
```bash
git commit -m "type(scope): short message"
```
Example:
```text
feat(api): add login endpoint
fix(auth): prevent null token crash
refactor(db): simplify connection logic
```
### 4. Regularly sync your branch with `dev`
```bash
git pull --rebase origin dev
```
Why rebase here?
Normal pull:
```text
A---B---C (dev)
     \
      D---E (feature)
```
After `git pull`:
```text
A---B---C------M
     \        /
      D------E
```
This creates an extra merge commit `M`.
After `git pull --rebase origin dev`:
```text
A---B---C---D'---E'
```
Your commits are replayed on top of the newest `dev`.
Benefits:
- cleaner history
- fewer useless merge commits
- conflicts appear earlier
- easier Pull Requests
### 5. Push your branch
First push:
```bash
git push -u origin feature/my-feature
```
Next pushes:
```bash
git push
```
### 6. Open Pull Request into `dev`
Pull Request before merge checklist:
- project builds/runs correctly
- tests pass
- docker works
- no obvious console errors
- PR has a clear description
### 7. Review and merge
- at least 1 approval
- merge only if branch is up to date
- prefer **Squash & Merge** or the team’s agreed merge strategy
---
### 8. Delete branch after merge
```bash
git switch dev
git pull origin dev
git branch -d feature/feature-name
```
---
# Commit Messages rules
## Format
```text
type(scope): short message
```
## Types
| Type | Meaning |
| ------------ | ------------------------------------------ |
| **feat** | New feature |
| **fix** | Bug fix |
| **docs** | Documentation change |
| **style** | Formatting (no code change) |
| **refactor** | Code improvement without changing behavior |
| **test** | Add or update tests |
| **chore** | Maintenance tasks |
| **build** | Build system / dependencies |
| **ci** | CI/CD changes |
| **perf** | Performance improvements |
## Scope examples
```text
frontend
backend
api
docker
auth
config
database
ui
```
## Good examples
```text
feat(frontend): add login page
feat(backend): add hello endpoint
fix(api): handle empty response
docs(readme): add setup instructions
chore(project): initialize folder structure
```
## Rules
- use imperative mood
- keep commits focused
- one logical change per commit
- prefer small commits over giant commits
---
# Forbidden
Never do this on shared branches:
```text
git push origin main
git push --force
git push -f
git reset --hard
```
---
# Avoid Unless Experienced
```text
git rebase
git rebase -i
git cherry-pick
git commit --amend
```
Allowed exception:
```text
git pull --rebase origin dev
```
This is safe when used on **your own feature branch**.
---
# Useful Commands
See branches:
```bash
git branch
git branch -r
```
Switch branch:
```bash
git switch branch-name
```
Fetch remote branches:
```bash
git fetch
```
See history:
```bash
git log --oneline --graph
```
---
# Recovery
See lost commits / recovery history
```bash
git reflog
```
Safest recovery pattern:
```bash
git branch rescue <commit-hash>
git switch rescue
```
---
# Golden rules
- `main` must always work
- never work directly on `main`
- usually do not work directly on `dev`
- one feature = one branch
- create every feature from `dev`
- sync often with `dev`
- test before opening a Pull Request
- open small PRs
- keep history readable
- do not break the team’s branch

