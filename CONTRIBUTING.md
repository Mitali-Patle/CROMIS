# Contributing Guide

Please follow the steps below to ensure a clean and consistent workflow.

---

## 1. Fork the Repository

1. Go to the GitHub repo:
   **[https://github.com/SudharsanSaravanan/se-project-2025](https://github.com/SudharsanSaravanan/se-project-2025)**
2. Click **Fork** (top-right corner).
3. This creates a copy of the repository under your GitHub account.

---

## 2. Clone Your Fork

```bash
git clone https://github.com/<your-username>/se-project-2025.git
cd se-project-2025
```

---

## 3. Create a Feature Branch

Always create a new branch before making any changes.

**Branch naming convention:**
`feature/<short-description>`
`fix/<short-description>`
`docs/<short-description>`

Examples:

```bash
git checkout -b feature/auth-ui
# or
git checkout -b fix/navbar-alignment
```

---

## 4. Run Code Formatting & Checks (MANDATORY)

Before committing, run:

```bash
npx prettier --write .
```

This ensures formatting is correct before you create a PR.

---

## 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new UI component"  # example
```

Follow conventional commit guidelines:

- `feat:` – new feature
- `fix:` – bug fix
- `docs:` – documentation
- `refactor:` – code improvement
- `style:` – formatting

---

## 6. Push Your Branch

```bash
git push origin feature/auth-ui
```

---

## 7. Create a Pull Request (PR)

1. Go to your fork on GitHub.
2. Click **Compare & pull request**.
3. Ensure:
   - Base repo → `SudharsanSaravanan/se-project-2025`
   - Base branch → `main`
   - Your branch → e.g., `feature/auth-ui`

4. Add a clear PR title and description.
5. If your PR includes frontend changes, please attach UI screenshots:
   - Before: previous UI
   - After: updated UI
6. Submit the PR.

---

## 8. Keep Your Fork Updated (important)

```bash
git checkout main
git pull upstream main
git push origin main
```

---

## Questions?

Feel free to open an issue or contact the maintainers.
