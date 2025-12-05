"use client";

import { useState, useEffect } from "react";
import { createUser, getUsers } from "../lib/api";

export default function Home() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [msg, setMsg] = useState("");
  const [users, setUsers] = useState([]);

  // Load existing MongoDB data
  const loadUsers = async () => {
    const res = await getUsers();
    if (res.success) {
      setUsers(res.data);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await createUser({ name, age });

    if (res.success) {
      setMsg("Data added successfully!");
      setName("");
      setAge("");

      // reload list
      loadUsers();
    } else {
      setMsg("Failed to insert data.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-zinc-50 dark:bg-black p-10">
      <main className="w-full max-w-2xl flex flex-col gap-10">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-black dark:text-white">
          Software Engineering Project 2025
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Add New User
          </h2>

          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded-md border dark:bg-zinc-800 dark:text-white"
            required
          />

          <input
            type="number"
            placeholder="Enter Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="p-3 rounded-md border dark:bg-zinc-800 dark:text-white"
            required
          />

          <button className="bg-black text-white p-3 rounded-md hover:bg-zinc-700">
            Submit
          </button>

          {msg && <p className="text-green-600 dark:text-green-400">{msg}</p>}
        </form>

        {/* Existing Data */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Existing Users
          </h2>

          {users.length === 0 ? (
            <p className="text-zinc-500 text-center">No users yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {users.map((u) => (
                <li
                  key={u._id}
                  className="border p-3 rounded-md dark:border-zinc-700 dark:text-white"
                >
                  <strong>Name:</strong> {u.name}
                  <br />
                  <strong>Age:</strong> {u.age}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
