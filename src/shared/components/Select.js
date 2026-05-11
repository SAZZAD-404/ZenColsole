"use client";

import { cn } from "@/shared/utils/cn";

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  error,
  hint,
  disabled = false,
  required = false,
  className,
  selectClassName,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[13px] font-medium text-text-main tracking-[-0.01em]">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "w-full py-2 px-3 pr-9 text-sm text-text-main",
            "bg-surface-2 border border-border-subtle rounded-[10px] appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface",
            "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
            "text-[16px] sm:text-sm",
            error && "ring-1 ring-danger/50 border-danger/40",
            selectClassName
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-text-subtle">
          <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-danger flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-text-subtle">{hint}</p>
      )}
    </div>
  );
}
