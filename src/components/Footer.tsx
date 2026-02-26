"use client";

export function Footer() {
  return (
    <footer className="border-t py-8" style={{ borderColor: "var(--card-border)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white font-bold text-xs">
              TF
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Training Feedback Portal
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
