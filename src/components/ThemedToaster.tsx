import { Toaster } from "react-hot-toast";
import { useTheme } from "../context/theme-context";

export default function ThemedToaster() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Toaster
      position="bottom-center"
      containerStyle={{ bottom: 24 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark
            ? "rgba(3, 7, 18, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
          color: isDark ? "rgb(243, 244, 246)" : "rgb(17, 24, 39)",
          backdropFilter: "blur(8px)",
          border: isDark
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
          borderRadius: "9999px",
          padding: "12px 20px",
          fontSize: "0.875rem",
          fontWeight: 500,
          maxWidth: "90vw",
        },
        success: { icon: null },
        error: { icon: null },
      }}
    />
  );
}
