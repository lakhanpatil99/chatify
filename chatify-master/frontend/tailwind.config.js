import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        border: "border 4s linear infinite",
      },
      keyframes: {
        border: {
          to: { "--border-angle": "360deg" },
        },
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        quatify: {
          "primary": "#6366f1", // Indigo 500
          "primary-content": "#ffffff",
          "secondary": "#06b6d4", // Cyan 500
          "secondary-content": "#ffffff",
          "accent": "#8b5cf6", // Violet 500
          "accent-content": "#ffffff",
          "neutral": "#1e293b", // Slate 800
          "neutral-content": "#f8fafc",
          "base-100": "#0f172a", // Slate 900
          "base-200": "#020617", // Slate 950 (Darker)
          "base-300": "#0b1121", // Deep Navy
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
  },
};
