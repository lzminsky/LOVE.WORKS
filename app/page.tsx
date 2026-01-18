"use client";

import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { AboutPanel } from "@/components/modals/AboutPanel";
import { ResetConfirmModal } from "@/components/modals/ResetConfirmModal";
import { GateScreen } from "@/components/gate/GateScreen";
import { ExportCard } from "@/components/export/ExportCard";

type View = "chat" | "gate" | "export";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check if user has seen welcome modal before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("love-works-welcome-seen");
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("love-works-welcome-seen", "true");
  };

  const handleShowAboutFromWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("love-works-welcome-seen", "true");
    setShowAbout(true);
  };

  const handleUnlock = () => {
    setIsUnlocked(true);
    setCurrentView("chat");
  };

  const handleExportAndReset = () => {
    setShowResetConfirm(false);
    setCurrentView("export");
  };

  const handleResetWithoutExport = () => {
    setShowResetConfirm(false);
    // In real implementation, would clear messages
  };

  // Render gate screen
  if (currentView === "gate") {
    return <GateScreen onUnlock={handleUnlock} />;
  }

  // Render export screen
  if (currentView === "export") {
    return <ExportCard onBack={() => setCurrentView("chat")} />;
  }

  // Render main chat interface
  return (
    <>
      <ChatInterface
        onShowGate={() => setCurrentView("gate")}
        onShowAbout={() => setShowAbout(true)}
        onShowExport={() => setCurrentView("export")}
        onShowResetConfirm={() => setShowResetConfirm(true)}
      />

      {/* Modals */}
      {showWelcome && (
        <WelcomeModal
          onClose={handleCloseWelcome}
          onAbout={handleShowAboutFromWelcome}
        />
      )}

      {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}

      {showResetConfirm && (
        <ResetConfirmModal
          onExportAndReset={handleExportAndReset}
          onResetWithoutExport={handleResetWithoutExport}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </>
  );
}
