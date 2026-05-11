"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  default: {
    bg: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.45)",
    border: "rgba(255,255,255,0.07)",
  },
  primary: {
    bg: "rgba(11,124,143,0.1)",
    color: "#2cb3d8",
    border: "rgba(11,124,143,0.18)",
  },
  success: {
    bg: "rgba(52,211,153,0.08)",
    color: "#34d399",
    border: "rgba(52,211,153,0.15)",
  },
  warning: {
    bg: "rgba(251,191,36,0.08)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.15)",
  },
  error: {
    bg: "rgba(248,113,113,0.08)",
    color: "#f87171",
    border: "rgba(248,113,113,0.15)",
  },
  info: {
    bg: "rgba(96,165,250,0.08)",
    color: "#60a5fa",
    border: "rgba(96,165,250,0.15)",
  },
  // Alias for backward compat
  neutral: {
    bg: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.45)",
    border: "rgba(255,255,255,0.07)",
  },
};

const dotColors = {
  default: "rgba(255,255,255,0.3)",
  primary: "#2cb3d8",
  success: "#34d399",
  warning: "#fbbf24",
  error:   "#f87171",
  info:    "#60a5fa",
  neutral: "rgba(255,255,255,0.3)",
};

const sizes = {
  sm: { px: "6px", py: "2px", fontSize: "10px", gap: "4px" },
  md: { px: "8px", py: "3px", fontSize: "11px", gap: "5px" },
  lg: { px: "10px", py: "4px", fontSize: "12px", gap: "6px" },
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  icon,
  className,
}) {
  const v = variants[variant] || variants.default;
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium tracking-[0.01em] shrink-0",
        className
      )}
      style={{
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        paddingLeft: s.px,
        paddingRight: s.px,
        paddingTop: s.py,
        paddingBottom: s.py,
        fontSize: s.fontSize,
        gap: s.gap,
      }}
    >
      {dot && (
        <span
          className="rounded-full shrink-0"
          style={{
            width: "5px",
            height: "5px",
            background: dotColors[variant] || dotColors.default,
          }}
        />
      )}
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "12px", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
