import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-col items-center text-center gap-10 px-6 py-20 max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold text-black dark:text-zinc-50 tracking-tight">
            Software Engineering Project 2025
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-lg leading-7">
          A full-stack web application built using Next.js (frontend) and
          Node.js + Express (backend) with a MongoDB database, containerized
          using Docker, deployed via Vercel (frontend) and Render/Railway
          (backend)
        </p>
      </main>
    </div>
  );
}
