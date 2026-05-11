"use client";

import { useEffect } from "react";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";

const sizes = {
  sm:    "max-w-sm",
  md:    "max-w-md",
  lg:    "max-w-lg",
  xl:    "max-w-xl",
  "2xl": "max-w-2xl",
  full:  "max-w-4xl",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  showCloseButton = true,
  showTrafficLights = true,
  className,
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 fade-in"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full rounded-[20px] fade-in",
          sizes[size],
          className
        )}
        style={{
          background: "rgba(16,20,28,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Title bar */}
        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3">
              {showTrafficLights && (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
              )}
              {title && (
                <h2 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
                  {title}
                </h2>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex items-center justify-center size-7 rounded-[8px] transition-colors"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-5 max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-2 px-5 py-3.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
        {message}
      </p>
    </Modal>
  );
}
