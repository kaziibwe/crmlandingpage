import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: { 50: "#f8fafc", 900: "#0f172a", 950: "#0b1120" },
        accent: { 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb" },
        violet2: { 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" },
      },
    },
  },
  plugins: [],
};

export default config;
