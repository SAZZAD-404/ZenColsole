"use client";

import { cn } from "@/shared/utils/cn";

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon,
  iconRight,
  disabled = false,
  required = false,
  readOnly = false,
  className,
  inputClassName,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[12px] font-semibold tracking-[0.01em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.25)" }}>
            <span className="material-symbols-outlined text-[17px]">{icon}</span>
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          className={cn(
            "w-full py-2 px-3 text-[13px] text-white rounded-[10px] outline-none transition-all duration-150",
            "placeholder-white/20",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "read-only:cursor-default",
            "text-[16px] sm:text-[13px]",
            icon && "pl-9",
            iconRight && "pr-9",
            inputClassName
          )}
          style={{
            background: error ? "rgba(248,113,113,0.06)" : "rgba(255,255,255,0.05)",
            border: error ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(255,255,255,0.08)",
          }}
          onFocus={e => {
            if (!error && !readOnly) {
              e.target.style.border = "1px solid rgba(11,124,143,0.6)";
              e.target.style.background = "rgba(255,255,255,0.07)";
              e.target.style.boxShadow = "0 0 0 3px rgba(11,124,143,0.1)";
            }
          }}
          onBlur={e => {
            e.target.style.border = error ? "1px solid rgba(248,113,113,0.4)" : "1px solid rgba(255,255,255,0.08)";
            e.target.style.background = error ? "rgba(248,113,113,0.06)" : "rgba(255,255,255,0.05)";
            e.target.style.boxShadow = "none";
          }}
          {...props}
        />
        {iconRight && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{ color: "rgba(255,255,255,0.25)" }}>
            <span className="material-symbols-outlined text-[17px]">{iconRight}</span>
          </div>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{hint}</p>
      )}
    </div>
  );
}
