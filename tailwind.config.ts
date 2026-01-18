import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#1a1a1a",
        "surface-hover": "#252525",
        text: "#e5e5e5",
        muted: "#737373",
        "muted-dark": "#525252",
        "muted-darker": "#3f3f3f",
        accent: "#d4a574",
        "accent-hover": "#e0b385",
        error: "#ef4444",
        success: "#4ade80",
        warning: "#fbbf24",
      },
      fontFamily: {
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        "slide-in": "slideIn 0.2s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        "spin": "spin 1s linear infinite",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "40%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
