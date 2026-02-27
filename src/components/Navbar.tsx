"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/register", label: "Register" },
  { href: "/feedback", label: "Feedback" },
  { href: "/dashboard", label: "Learning" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-accent-purple text-white font-bold text-xs">
            IF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight" style={{ color: "var(--foreground)" }}>
              IntelliForge AI
            </span>
            <span className="text-[10px] font-medium leading-tight" style={{ color: "var(--muted)" }}>
              Learning
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-primary-600" : "hover:text-primary-600"
                }`}
                style={{ color: isActive ? undefined : "var(--muted)" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg bg-primary-50 dark:bg-primary-900/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.intelliforge.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:border-primary-400 hover:text-primary-600 lg:inline-flex"
            style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            intelliforge.tech
          </a>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          )}

          {/* User Menu */}
          {session ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30"
              >
                {session.user?.image ? (
                  <Image src={session.user.image} alt="" width={32} height={32} className="h-8 w-8 rounded-full ring-2 ring-primary-500/20" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl border shadow-xl"
                  style={{ background: "var(--surface)", borderColor: "var(--card-border)" }}
                >
                  <div className="border-b p-3" style={{ borderColor: "var(--card-border)" }}>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{session.user?.name}</p>
                    <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{session.user?.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30" style={{ color: "var(--foreground)" }}>
                      <svg className="h-4 w-4" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                      </svg>
                      My Learning
                    </Link>
                    <Link href="/register" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30" style={{ color: "var(--foreground)" }}>
                      <svg className="h-4 w-4" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Register for Session
                    </Link>
                    <Link href="/feedback" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30" style={{ color: "var(--foreground)" }}>
                      <svg className="h-4 w-4" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                      Give Feedback
                    </Link>
                  </div>
                  <div className="border-t p-1.5" style={{ borderColor: "var(--card-border)" }}>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ redirect: false }); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="hidden items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-700 sm:inline-flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Sign In
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Menu"
          >
            <svg className="h-5 w-5" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t px-4 py-3 md:hidden"
          style={{ borderColor: "var(--card-border)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium ${
                pathname === link.href ? "text-primary-600 bg-primary-50 dark:bg-primary-900/30" : ""
              }`}
              style={{ color: pathname === link.href ? undefined : "var(--muted)" }}
            >
              {link.label}
            </Link>
          ))}

          {!session && (
            <button
              onClick={() => { setMobileOpen(false); signIn("google"); }}
              className="mt-2 flex w-full items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Sign in with Google
            </button>
          )}

          <a
            href="https://www.intelliforge.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-primary-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Visit IntelliForge AI
          </a>
        </motion.div>
      )}
    </nav>
  );
}
