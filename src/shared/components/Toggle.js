"use client";

import { cn } from "@/shared/utils/cn";

const trackSizes = {
  sm: "w-8  h-[18px]",
  md: "w-10 h-[22px]",
  lg: "w-12 h-[26px]",
};
const thumbSizes = {
  sm: "size-[14px] translate-x-[2px]",
  md: "size-[18px] translate-x-[2px]",
  lg: "size-[22px] translate-x-[2px]",
};
const thumbOn = {
  sm: "translate-x-[18px]",
  md: "translate-x-[22px]",
  lg: "translate-x-[26px]",
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full",
          "transition-colors duration-200 ease-in-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          checked ? "bg-primary" : "bg-surface-3",
          trackSizes[size],
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white",
            "shadow-[0_1px_3px_rgba(0,0,0,0.25)]",
            "transform transition-transform duration-200 ease-in-out",
            "absolute top-1/2 -translate-y-1/2",
            checked ? thumbOn[size] : thumbSizes[size].split(" ")[1],
            thumbSizes[size].split(" ")[0]
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col min-w-0">
          {label && (
            <span className="text-sm font-medium text-text-main tracking-[-0.01em]">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-muted mt-0.5">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
