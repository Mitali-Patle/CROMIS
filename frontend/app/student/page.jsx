"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProposalForm from "./components/ProposalForm";
import MyProposals from "./components/MyProposals";
import Drafts from "./components/Drafts";

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        return <Dashboard onNavigate={setActiveTab} />;
      case "new":
        return <ProposalForm />;
      case "my":
        return <MyProposals />;
      case "drafts":
        return <Drafts />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex bg-black text-white min-h-screen">
      <Sidebar
        activeTab={activeTab}
        onNavClick={setActiveTab}
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
