"use client";

import { cn } from "@/shared/utils/cn";

const sizes = {
  xs: "h-6  px-2.5 text-[11px] gap-1   rounded-[6px]",
  sm: "h-[28px] px-3 text-[12px] gap-1.5 rounded-[8px]",
  md: "h-9  px-4   text-[13px] gap-2   rounded-[9px]",
  lg: "h-10 px-5   text-[13.5px] gap-2 rounded-[10px]",
  xl: "h-11 px-6   text-[14px] gap-2.5 rounded-[10px]",
};

const iconSizes = {
  xs: "text-[13px]",
  sm: "text-[14px]",
  md: "text-[15px]",
  lg: "text-[16px]",
  xl: "text-[17px]",
};

const variantStyles = {
  primary: {
    background: "#0B7C8F",
    color: "white",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  secondary: {
    background: "rgba(255,255,255,0.09)",
    color: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  outline: {
    background: "transparent",
    color: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  ghost: {
    background: "transparent",
    color: "rgba(255,255,255,0.38)",
    border: "1px solid transparent",
  },
  danger: {
    background: "rgba(248,113,113,0.1)",
    color: "#f87171",
    border: "1px solid rgba(248,113,113,0.2)",
  },
  success: {
    background: "rgba(52,211,153,0.1)",
    color: "#34d399",
    border: "1px solid rgba(52,211,153,0.2)",
  },
};

const variantHover = {
  primary:   {
    background: "#0a6d80",
    boxShadow: "0 2px 8px rgba(11,124,143,0.35), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  secondary: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.9)" },
  outline:   {
    background: "rgba(255,255,255,0.05)",
    borderColor: "rgba(11,124,143,0.35)",
    color: "rgba(255,255,255,0.85)",
  },
  ghost:     { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.75)" },
  danger:    { background: "rgba(248,113,113,0.16)", borderColor: "rgba(248,113,113,0.3)" },
  success:   { background: "rgba(52,211,153,0.16)", borderColor: "rgba(52,211,153,0.3)" },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  style,
  ...props
}) {
  const baseStyle = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-[-0.01em]",
        "transition-all duration-150 ease-out cursor-pointer select-none whitespace-nowrap",
        "active:scale-[0.97] active:brightness-95",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      style={{ ...baseStyle, ...style }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          const h = variantHover[variant] || {};
          Object.assign(e.currentTarget.style, h);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, baseStyle);
          if (style) Object.assign(e.currentTarget.style, style);
        }
      }}
      {...props}
    >
      {loading ? (
        <span className={cn("material-symbols-outlined animate-spin", iconSizes[size])}>
          progress_activity
        </span>
      ) : icon ? (
        <span
          className={cn("material-symbols-outlined", iconSizes[size])}
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          {icon}
        </span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span
          className={cn("material-symbols-outlined", iconSizes[size])}
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          {iconRight}
        </span>
      )}
    </button>
  );
}
