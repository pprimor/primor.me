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
        // xterm's default 16-colour palette; blue and red are nudged brighter to pass AA on black.
        term: {
          bg: "#000000",
          fg: "#e5e5e5",
          muted: "#7f7f7f",
          accent: "#00cd00",
          path: "#6e6eff",
          heading: "#ffffff",
          link: "#00cdcd",
          error: "#ff5555",
          warn: "#cdcd00",
        },
      },
    },
  },
  plugins: [],
};
