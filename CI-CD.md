# **CI/CD Pipeline Documentation**

This project uses **Continuous Integration (CI)** to automatically check code quality, build the application, and ensure everything runs correctly before merging or deployment.

The CI/CD system is implemented using **GitHub Actions** and includes three major workflows:

---

## **1. Super Linter Workflow**

**File:** `.github/workflows/superlinter.yml`

This workflow runs the official **GitHub Super Linter** to validate basic files in the project.

### ✔ What it validates:

- JSON files
- YAML files

### What is disabled:

Super Linter linters that conflict with Next.js & Tailwind were turned off:

- CSS linting
- Markdown linting

### Why?

Because Tailwind CSS, Next.js JSX, and default README formatting create false errors.

---

## **2. Backend CI Workflow**

**File:** `.github/workflows/backend-ci.yml`

This workflow checks the **Node.js backend** to ensure it installs and runs without issues.

### ✔ What it does:

- Installs backend dependencies
- Uses Node.js 18
- Runs the backend using `node server.js`
- Ensures there are no crashes

### Purpose:

To confirm the backend is always in a runnable state after every commit.

---

## **3. Frontend CI Workflow**

**File:** `.github/workflows/frontend-ci.yml`

This workflow builds the **Next.js frontend** using the correct Node version.

### ✔ What it does:

- Installs frontend dependencies
- Uses **Node.js 20.10.0** (required for Next.js 16)
- Runs `npm run build`
- Ensures there are no build errors

### Why Node 20?

Next.js 16 requires Node.js **version ≥ 20.9.0**.

---

## **4. Prettier – Code Formatting**

To avoid formatting-related CI issues, Prettier is used.

### ✔ How to format code:

Run this before every commit:

```bash
npx prettier --write .
```

This formats:

- JavaScript
- JSON
- Markdown
- YAML

### ✔ Why?

Proper formatting ensures:

- Fewer merge conflicts
- No Super Linter formatting errors
- Consistent codebase

---

## **Workflow Summary**

| Workflow         | Purpose                         | Status        |
| ---------------- | ------------------------------- | ------------- |
| **Super Linter** | Validates JSON, YAML, ENV       | ✔ Configured  |
| **Backend CI**   | Installs & runs Node.js backend | ✔ Working     |
| **Frontend CI**  | Builds Next.js using Node 20    | ✔ Working     |
| **Prettier**     | Formats code before commit      | ✔ Recommended |

---

# **Final Notes**

These CI/CD pipelines ensure:

- Every commit is clean
- The backend runs without crashing
- The frontend builds successfully
- The repository maintains professional standard practices
