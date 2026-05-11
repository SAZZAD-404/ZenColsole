"use client";
import { useEffect, useState } from "react";

/**
 * ClientOnly wrapper component
 * Prevents hydration mismatch by only rendering children on client-side
 * Useful for components with animations, canvas, or browser-specific APIs
 */
export default function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return <>{children}</>;
}
