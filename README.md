# **CROMIS - Campus Reservation & Optimization Management Intelligence System**

A full-stack web application built using **Next.js (frontend)** and **Node.js + Express (backend)** with a **MongoDB database**, containerized using **Docker**.

## **Tech Stack**

### **Frontend (Client)**

- Next.js 15 (App Router)
- React
- Tailwind CSS

### **DevOps & Deployment**

- Git & GitHub (version control + remote code hosting)
- GitHub Actions (CI) (automated testing/building on every push)
- GHCR (GitHub Container Registry) (stores & hosts Docker images built from your repo)
- Docker (containerization) (packages the app + dependencies into portable containers)
- Podman (container engine) (Docker-compatible, daemonless alternative for running containers)

---

## **Project Folder Structure**

```
SEP-2025/
│
├── backend/
│   ├── Dockerfile               # Backend Dockerfile (NEW)
│   ├── .dockerignore
│   ├── .gitignore
│   ├── server.js                # Backend entry point
│   ├── package.json
│   ├── .env.example
│   │
│   └── src/
│       ├── app.js               # Express app config
│       │
│       ├── routes/              # API Routes
│       │   └── index.js
│       │
│       ├── controllers/         # Controller functions
│       │   └── sampleController.js
│       │
│       ├── models/              # Mongoose models (User, etc.)
│       │   └── User.js
│       │
│       └── config/              # DB configuration
│           └── db.js
│
│
├── frontend/
│   ├── public/                  # Static assets
│   ├── app/                     # Next.js App Router
│   ├── lib/
│   │   └── api.js
│   ├── Dockerfile               # Frontend Dockerfile (NEW)
│   ├── .dockerignore
│   ├── .env.example
│   │
│   ├── package.json
│   ├── jsconfig.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   └── .gitignore
│
│
├── infra/
│   └── docker-compose.yml       # Combined Docker setup (NEW)
│
└── README.md                    # Project documentation
```

---

## **Backend – How to Run**

Inside the `backend/` folder:

### 1️⃣ Install dependencies

```
npm install
```

### 2️⃣ Create `.env` file

Copy the example:

```
cp .env.example .env
```

### 3️⃣ Start server

Development:

```
npm run dev
```

Production:

```
npm start
```

## **Frontend – How to Run**

Inside the `frontend/` folder:

### 1️⃣ Install dependencies

```
npm install
```

### 2️⃣ Add environment variable

Create `frontend/.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 3️⃣ Run development server

```
npm run dev
```

Frontend will run on:

```
http://localhost:3000
```

---

## Code Formatting (Important — run before committing)

To avoid Super Linter errors and maintain clean, consistent code formatting across the project, **run Prettier before every commit**:

```bash
npx prettier --write .
```

This will automatically format:

- JavaScript files
- JSON files
- Markdown files
- YAML files
- CSS files (optional)

After formatting, commit the changes:

```bash
git add .
git commit -m "style: auto format with Prettier"
git push
```

---

# **Docker Setup (Frontend + Backend)**

This project includes full **Docker containerization** for both the **Node.js backend** and **Next.js frontend**, managed via **Docker Compose** inside the `infra/` folder.

## Folder Structure (Docker Related)

```
SE-2025/
├── backend/           # Backend source + Dockerfile
├── frontend/          # Frontend source + Dockerfile
└── infra/
    └── docker-compose.yml
```

---

## 🐳 Build & Run with Docker Compose\*\*

Move into the `infra/` directory:

```bash
cd infra
```

### **Run the entire project (frontend + backend):**

```bash
docker compose up --build
```

This will:

- Build **two images**
  - `frontend` (Next.js)
  - `backend` (Express + Node)

- Start **two containers**
- Create a shared Docker network

---

Here’s a **short and simple README addition**:

---

### ▶️ Run from GHCR (Podman)

A pre-built frontend image is available on GHCR:

```
ghcr.io/sudharsansaravanan/se-frontend:latest
```

Pull and run with Podman:

```bash
podman pull ghcr.io/sudharsansaravanan/se-frontend:latest
podman run -p 3000:3000 ghcr.io/sudharsansaravanan/se-frontend:latest
```

---

### Devops Architecture:
<img width="1408" height="768" alt="devops_pipeline_complete_white (1)" src="https://github.com/user-attachments/assets/bce27dae-d268-4c25-9905-e5db5d4bcadd" />
