"use client";

import { cn } from "@/shared/utils/cn";

export function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "text-[16px]",
    md: "text-[22px]",
    lg: "text-[30px]",
    xl: "text-[40px]",
  };
  return (
    <span
      className={cn(
        "material-symbols-outlined animate-spin text-primary",
        sizes[size],
        className
      )}
    >
      progress_activity
    </span>
  );
}

export function PageLoading({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg">
      <Spinner size="xl" />
      <p className="mt-4 text-sm text-text-muted">{message}</p>
    </div>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[8px] bg-surface-2",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-surface-3/60 after:to-transparent",
        "after:animate-[shimmer_1.6s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      className="p-5 rounded-[14px] animate-pulse"
      style={{
        background: "rgba(14,17,24,0.9)",
        border: "1px solid rgba(255,255,255,0.055)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-[9px]" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-28" style={{ background: "rgba(255,255,255,0.05)" }} />
            <Skeleton className="h-2.5 w-20" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        </div>
        <Skeleton className="h-7 w-20 rounded-[8px]" style={{ background: "rgba(255,255,255,0.05)" }} />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-2.5 w-full" style={{ background: "rgba(255,255,255,0.04)" }} />
        <Skeleton className="h-2.5 w-4/5" style={{ background: "rgba(255,255,255,0.035)" }} />
        <Skeleton className="h-2.5 w-3/5" style={{ background: "rgba(255,255,255,0.03)" }} />
      </div>
    </div>
  );
}

export default function Loading({ type = "spinner", ...props }) {
  switch (type) {
    case "page":     return <PageLoading {...props} />;
    case "skeleton": return <Skeleton {...props} />;
    case "card":     return <CardSkeleton {...props} />;
    default:         return <Spinner {...props} />;
  }
}
