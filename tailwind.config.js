/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./404.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./App.tsx",
    "./main.tsx",
    "./404-main.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        ui: ["Tahoma", "Verdana", "DejaVu Sans", "Segoe UI", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      colors: {
        x11: {
          face: "#c0c0c0",
          light: "#ffffff",
          shadow: "#808080",
          dark: "#1f1f1f",
          desktop: "#2f6f6f",
        },
        term: {
          bg: "#0d1117",
          fg: "#e6edf3",
          muted: "#8b949e",
          accent: "#3fb950",
          heading: "#d2a8ff",
          link: "#58a6ff",
          error: "#ff7b72",
        },
      },
    },
  },
  plugins: [],
};
