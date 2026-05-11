"use client";

import { useTheme } from "@/shared/hooks/useTheme";
import { cn } from "@/shared/utils/cn";

export default function ThemeToggle({ className, variant = "default" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center size-8 rounded-[8px] transition-all duration-150",
        className
      )}
      style={{ color: "rgba(255,255,255,0.4)" }}
      onMouseEnter={e => {
        e.currentTarget.style.color = "white";
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = "rgba(255,255,255,0.4)";
        e.currentTarget.style.background = "transparent";
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
