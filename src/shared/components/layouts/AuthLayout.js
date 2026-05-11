"use client";

import PropTypes from "prop-types";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-bg overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid */}
        <div className="grid-overlay absolute inset-0" />
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-300/4 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 relative">
        {children}
      </main>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
