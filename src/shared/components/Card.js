"use client";

import { cn } from "@/shared/utils/cn";

const paddings = {
  none: "",
  xs:   "p-3",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
  xl:   "p-8",
};

export default function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = "lg",
  hover = false,
  elev = false,
  noBorder = false,
  className,
  style,
  ...props
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] transition-all duration-200",
        hover && "cursor-pointer hover:-translate-y-[1px]",
        paddings[padding],
        className
      )}
      style={{
        background: "rgba(14,17,24,0.9)",
        border: noBorder ? "none" : "1px solid rgba(255,255,255,0.055)",
        boxShadow: elev
          ? "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.025)",
        ...style,
      }}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div
                className="flex items-center justify-center size-8 rounded-[9px] shrink-0"
                style={{
                  background: "rgba(11,124,143,0.1)",
                  color: "#2cb3d8",
                  border: "1px solid rgba(11,124,143,0.15)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                >
                  {icon}
                </span>
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3
                  className="font-semibold text-white tracking-[-0.02em] truncate"
                  style={{ fontSize: 13 }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className="mt-0.5 truncate"
                  style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0 ml-3">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Card.Skeleton ── */
Card.Skeleton = function CardSkeleton({ lines = 3, className }) {
  return (
    <div
      className={cn("rounded-[14px] p-5 animate-pulse", className)}
      style={{
        background: "rgba(14,17,24,0.9)",
        border: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <div
        className="h-3.5 w-1/3 rounded-full mb-4"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 rounded-full mb-2.5"
          style={{
            background: "rgba(255,255,255,0.04)",
            width: `${65 + (i % 3) * 12}%`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Card.Section ── */
Card.Section = function CardSection({ children, className, style, ...props }) {
  return (
    <div
      className={cn("p-4 rounded-[10px]", className)}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/* ── Card.Row ── */
Card.Row = function CardRow({ children, className, ...props }) {
  return (
    <div
      className={cn("py-3 transition-colors duration-100", className)}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      {...props}
    >
      {children}
    </div>
  );
};

/* ── Card.ListItem ── */
Card.ListItem = function CardListItem({ children, actions, className, ...props }) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between py-3 px-1 -mx-1 rounded-[8px] transition-all duration-100",
        className
      )}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.025)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {actions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/* ── Card.Stat ── a compact metric display ── */
Card.Stat = function CardStat({ label, value, delta, icon, accent = false, className }) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4 rounded-[12px]", className)}
      style={{
        background: accent
          ? "rgba(11,124,143,0.07)"
          : "rgba(255,255,255,0.025)",
        border: accent
          ? "1px solid rgba(11,124,143,0.12)"
          : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-medium tracking-wide uppercase"
          style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.07em" }}
        >
          {label}
        </span>
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 14,
              color: accent ? "#2cb3d8" : "rgba(255,255,255,0.2)",
              fontVariationSettings: "'FILL' 0, 'wght' 300",
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <span
        className="font-semibold tracking-[-0.03em] text-white"
        style={{ fontSize: 22 }}
      >
        {value}
      </span>
      {delta !== undefined && (
        <span
          className="text-[11px] font-medium"
          style={{
            color: delta >= 0 ? "#34d399" : "#f87171",
          }}
        >
          {delta >= 0 ? "+" : ""}{delta}%
        </span>
      )}
    </div>
  );
};
