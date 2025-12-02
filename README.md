# **SE Project 2025**

A full-stack web application built using **Next.js (frontend)** and **Node.js + Express (backend)** with a **MongoDB database**, containerized using **Docker**, deployed via **Vercel** (frontend) and **Render/Railway** (backend).

# **Tech Stack**

## **Frontend (Client)**

* Next.js 15 (App Router)
* React
* Tailwind CSS
* Axios (API calls)
* Vercel Deployment

## **DevOps & Deployment**

* Git & GitHub
* GitHub Actions (CI)
* Docker containerization (backend)
* Vercel (frontend hosting)
* Render / Railway (backend hosting)

---

# **Project Folder Structure**

```
SE-2025/
│
├── backend/
│   ├── server.js               # Backend entry point
│   ├── package.json
│   ├── .env.example
│   │
│   └── src/
│       ├── app.js              # Express app config
│       │
│       ├── routes/             # API Routes
│       │   └── index.js
│       │
│       ├── controllers/        # Controller functions
│       │   └── sampleController.js
│       │
│       ├── models/             # Mongoose models (User, Appointment, etc.)
│       │   └── User.js
│       │
│       └── config/             # DB configuration
│           └── db.js
│
│
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   ├── public/                 # Static assets
│   ├── node_modules/
│   ├── .next/                  # Build output
│   │
│   ├── package.json
│   ├── jsconfig.json
│   ├── next.config.mjs
│   ├── postcss.config.mjs
│   ├── tailwind.config.js
│   └── .gitignore
│
│
└── README.md                  # Project documentation
```

---

# ⚙️ **Backend – How to Run**

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


# 🖥️ **Frontend – How to Run**

Inside the `frontend/` folder:

### 1️⃣ Install dependencies

```
npm install
```

### 2️⃣ Add environment variable

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3️⃣ Run development server

```
npm run dev
```

Frontend will run on:

**[http://localhost:3000](http://localhost:3000)**

---


