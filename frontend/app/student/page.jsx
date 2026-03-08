"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import { useRouter } from "next/navigation";
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProposalForm from "./components/ProposalForm";
import MyProposals from "./components/MyProposals";
import Drafts from "./components/Drafts";
<<<<<<< HEAD
import Profile from "../components/Profile";

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Role guard — student only
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.replace("/login");
      return;
    }
    if (role === "faculty") {
      router.replace("/faculty");
      return;
    }
    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    const tab = sessionStorage.getItem("openTab");
    if (tab) {
      setActiveTab(tab);
      sessionStorage.removeItem("openTab");
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
=======

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
  const tab = sessionStorage.getItem("openTab");
  if (tab) {
    setActiveTab(tab);
    sessionStorage.removeItem("openTab");
  }
}, []);


  const renderContent = () => {
    switch (activeTab) {
      case "home":
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
        return <Dashboard onNavigate={setActiveTab} />;
      case "new":
        return <ProposalForm />;
      case "my":
        return <MyProposals />;
      case "drafts":
        return <Drafts />;
<<<<<<< HEAD
      case "profile":
        return <Profile />;
=======
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex bg-black text-white h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onNavClick={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto pb-20 md:pb-6">
=======
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar activeTab={activeTab} onNavClick={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
>>>>>>> 0f2863ee724e31c51240088c1d7b59dfa5009692
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
