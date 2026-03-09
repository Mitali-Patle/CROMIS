"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProposalForm from "./components/ProposalForm";
import MyProposals from "./components/MyProposals";
import Drafts from "./components/Drafts";
import Profile from "../components/Profile";
import ResourceCalendar from "./components/ResourceCalendar";
import ResourceDetail from "./components/ResourceDetail";

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
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
    // Story 7: If a resource is selected, show its detail page
    if (selectedResourceId) {
      return (
        <ResourceDetail
          resourceId={selectedResourceId}
          onBack={() => setSelectedResourceId(null)}
        />
      );
    }

    switch (activeTab) {
      case "overview":
        return <Dashboard onNavigate={setActiveTab} />;
      case "new":
        return <ProposalForm />;
      case "my":
        return <MyProposals />;
      case "drafts":
        return <Drafts />;
      case "profile":
        return <Profile />;
      case "calendar":
        return <ResourceCalendar onResourceClick={setSelectedResourceId} />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex bg-black text-white h-screen overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onNavClick={(tab) => {
          setActiveTab(tab);
          setSelectedResourceId(null); // Clear detail view on nav
        }}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

