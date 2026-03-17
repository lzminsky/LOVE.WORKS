"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Skin = "clinical" | "soft";

interface SkinContextType {
  skin: Skin;
  toggleSkin: () => void;
}

const SkinContext = createContext<SkinContextType>({
  skin: "clinical",
  toggleSkin: () => {},
});

export function useSkin() {
  return useContext(SkinContext);
}

const STORAGE_KEY = "love-works-skin";

export function SkinProvider({ children }: { children: ReactNode }) {
  const [skin, setSkin] = useState<Skin>("clinical");
  const [mounted, setMounted] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Skin | null;
    if (saved === "soft" || saved === "clinical") {
      setSkin(saved);
      document.documentElement.setAttribute("data-skin", saved);
    }
    setMounted(true);
  }, []);

  const toggleSkin = () => {
    const next = skin === "clinical" ? "soft" : "clinical";
    setSkin(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("data-skin", next);
  };

  // Set initial data-skin attribute
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-skin", skin);
    }
  }, [skin, mounted]);

  return (
    <SkinContext.Provider value={{ skin, toggleSkin }}>
      {children}
    </SkinContext.Provider>
  );
}
