# **CI/CD Pipeline Documentation**

This project uses a modular **Continuous Integration (CI)** and optional **Continuous Deployment (CD)** system using **GitHub Actions**.
Each workflow focuses on a single responsibility, ensuring fast, reliable, and clean builds.

The CI/CD system contains **four workflows**:

---

## **1. Super Linter Workflow**

**File:** `.github/workflows/super-linter.yml`

This workflow runs the official GitHub **Super Linter** to validate general project files.

### ✔ Validates:

- JSON
- YAML

### Disabled linters:

These were disabled because they conflict with TailwindCSS & Next.js formatting, causing false errors:

- CSS linting
- Markdown linting

### Purpose:

Ensures core config files are always valid.

---

## **2. Backend CI Workflow**

**File:** `.github/workflows/backend-ci.yml`

This workflow validates the **Node.js backend** before merging changes.

### ✔ What it does:

- Installs backend dependencies (`npm install`)
- Uses Node.js **18**
- Runs backend (`node server.js`) to confirm it starts without crashing

### Purpose:

Guarantees backend code is always in a stable, runnable state.

---

## **3. Frontend CI Workflow**

**File:** `.github/workflows/frontend-ci.yml`

This pipeline builds the **Next.js frontend** to ensure it compiles successfully.

### ✔ What it does:

- Installs frontend dependencies
- Uses **Node.js 20.10.0** (required for Next.js 16)
- Executes `npm run build`

### Why Node 20?

Next.js 16 requires:

```
Node >= 20.9.0
```

### Purpose:

Prevents broken builds from reaching `main`.

---

## **4. GHCR Docker Image Workflow (Manual Deploy)**

**File:** `.github/workflows/ghcr-deploy.yml`

This workflow builds **Docker images** for both:

- Frontend (`se-frontend`)
- Backend (`se-backend`)

…and pushes them to **GitHub Container Registry (GHCR)**.

### Trigger Type: **Manual Only**

The workflow runs **only when manually triggered**:

```yaml
on:
  workflow_dispatch:
```

This prevents:

- Slow CI during development
- GHCR storage spam
- Permission errors
- Unnecessary builds on every PR

### ✔ What it does:

- Builds Docker images for:
  - Frontend
  - Backend

- Logs in to GHCR
- Pushes both images with tag `latest`

### Purpose:

Used for deployment **only when needed**, not during everyday development.

---

## **5. Prettier – Code Formatting**

Before committing, format the code using:

```bash
npx prettier --write .
```

This ensures:

- No formatting issues in CI
- Consistent codebase
- Fewer merge conflicts
- Cleaner PRs

---

## **Workflow Summary Table**

| Workflow         | Purpose                       | Trigger             | Status        |
| ---------------- | ----------------------------- | ------------------- | ------------- |
| **Super Linter** | Validates JSON/YAML/ENV       | On PR/Push          | ✔ Active      |
| **Backend CI**   | Installs & runs Node backend  | On PR/Push          | ✔ Active      |
| **Frontend CI**  | Builds Next.js app            | On PR/Push          | ✔ Active      |
| **GHCR Deploy**  | Builds & pushes Docker images | Manual (`dispatch`) | ✔ Ready       |
| **Prettier**     | Formats all project files     | Before commits      | ✔ Recommended |

---

## **Pipeline Architecture (Diagram)**

<img width="1919" height="771" alt="image" src="https://github.com/user-attachments/assets/a5eadaed-c8e9-403f-a4f4-5470e9038e3b" />

---

## **Final Notes**

Your CI/CD setup ensures:

- Every commit is validated
- Backend always runs successfully
- Frontend always builds cleanly
- Code formatting remains consistent
- Docker images can be deployed **on demand**
- Development remains fast and stable

This structured CI system keeps your repository professional and ready for production scaling.
