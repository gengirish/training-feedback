"use client";

export function Footer() {
  return (
    <footer className="border-t py-10" style={{ borderColor: "var(--card-border)" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent-purple text-white font-bold text-xs">
                IF
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>IntelliForge AI</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Training Feedback Portal</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              AI Solutions for Every Level of Your Business.
              From foundations to full AI-powered applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Register", href: "/register" },
                { label: "Give Feedback", href: "/feedback" },
                { label: "Learning", href: "/learning" },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm transition-colors hover:text-primary-600" style={{ color: "var(--muted)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* IntelliForge AI */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>IntelliForge AI</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "https://www.intelliforge.tech/" },
                { label: "Services", href: "https://www.intelliforge.tech/#services" },
                { label: "About", href: "https://www.intelliforge.tech/#about" },
                { label: "Pricing", href: "https://www.intelliforge.tech/#pricing" },
                { label: "Contact", href: "https://www.intelliforge.tech/#contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm transition-colors hover:text-primary-600"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                    <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: "var(--card-border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} IntelliForge AI. All rights reserved.
          </p>
          <a
            href="https://www.intelliforge.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary-600"
            style={{ color: "var(--muted)" }}
          >
            Powered by
            <span className="font-bold text-gradient">IntelliForge AI</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
