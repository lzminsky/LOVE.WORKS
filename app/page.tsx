"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { AboutPanel } from "@/components/modals/AboutPanel";
import { ResetConfirmModal } from "@/components/modals/ResetConfirmModal";
import { GateScreen } from "@/components/gate/GateScreen";
import { ExportCard } from "@/components/export/ExportCard";
import { CONFIG } from "@/lib/constants";
import { Analytics } from "@/lib/analytics";

type View = "chat" | "gate" | "export";

interface Equilibrium {
  id: string;
  name: string;
  description: string;
  confidence: number;
  predictions: {
    outcome: string;
    probability: number;
    level: "high" | "medium" | "low" | "minimal";
  }[];
}

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  phase?: string;
  equilibrium?: Equilibrium;
  formalAnalysis?: {
    parameters: { param: string; value: string; basis: string }[];
    extensions: { id: string; name: string; status: string; detail: string }[];
  };
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [latestEquilibrium, setLatestEquilibrium] = useState<Equilibrium | undefined>();
  const [exportMessages, setExportMessages] = useState<Message[]>([]);
  const [gatePromptCount, setGatePromptCount] = useState<number>(CONFIG.maxFreeMessages);

  // Track page view and check if user has seen welcome modal before
  useEffect(() => {
    // Track page view
    Analytics.pageView("home", document.referrer || undefined);

    const hasSeenWelcome = localStorage.getItem("lovebomb-works-welcome-seen");
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("lovebomb-works-welcome-seen", "true");
  };

  const handleShowAboutFromWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem("lovebomb-works-welcome-seen", "true");
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

  const handleEquilibriumUpdate = useCallback((equilibrium: Equilibrium) => {
    setLatestEquilibrium(equilibrium);
  }, []);

  // Track messages for export
  const handleMessagesUpdate = useCallback((messages: Message[]) => {
    setExportMessages(messages);
  }, []);

  // Handler to show gate with current prompt count
  const handleShowGate = useCallback((promptCount: number) => {
    setGatePromptCount(promptCount);
    setCurrentView("gate");
  }, []);

  // Handler to show export with messages
  const handleShowExport = useCallback((messages: Message[]) => {
    setExportMessages(messages);
    setCurrentView("export");
  }, []);

  // Render gate screen
  if (currentView === "gate") {
    return (
      <GateScreen
        onUnlock={handleUnlock}
        promptCount={gatePromptCount}
        maxPrompts={CONFIG.maxFreeMessages}
      />
    );
  }

  // Render export screen
  if (currentView === "export") {
    return (
      <ExportCard
        onBack={() => setCurrentView("chat")}
        equilibrium={latestEquilibrium}
        messages={exportMessages}
      />
    );
  }

  // Render main chat interface
  return (
    <>
      <ChatInterface
        onShowGate={handleShowGate}
        onShowAbout={() => setShowAbout(true)}
        onShowExport={handleShowExport}
        onShowResetConfirm={() => setShowResetConfirm(true)}
        onEquilibriumUpdate={handleEquilibriumUpdate}
        onMessagesUpdate={handleMessagesUpdate}
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
