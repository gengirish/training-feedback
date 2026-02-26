"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { recordings } from "@/data/recordings";

export default function LearningPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30">
              <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Learning Videos</h1>
            <p className="mt-3" style={{ color: "var(--muted)" }}>
              Sign in with your Google account to access training videos and learning content.
            </p>
            <button
              onClick={() => signIn("google")}
              className="mt-8 inline-flex items-center gap-3 rounded-xl border bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98] dark:bg-gray-800 dark:text-gray-200"
              style={{ borderColor: "var(--card-border)" }}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="section-title">Learning</h1>
          <p className="section-subtitle">Training videos and setup guides — sign in required to view</p>

          {/* Setup Guides */}
          <div className="mt-12 space-y-4">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Setup Guides</h2>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card overflow-hidden"
            >
              <a
                href="https://www.codecademy.com/article/how-to-set-up-and-use-google-antigravity"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 transition-colors hover:bg-primary-50/30 dark:hover:bg-primary-900/10 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                      How to Set Up and Use Google Antigravity
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      Step-by-step guide to install Google Antigravity on your laptop or system. Learn how to configure the Agent Manager, choose development modes, and build your first project using agent-driven development.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600">
                      Read guide on Codecademy
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card overflow-hidden"
            >
              <a
                href="https://zenn.dev/neotechpark/articles/578723a5457e76"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 transition-colors hover:bg-primary-50/30 dark:hover:bg-primary-900/10 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                      Anti Gravity Explained: Google&apos;s Agent-First Development Platform
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      Deep dive into agent-first development: the three surfaces (Agent Manager, Editor, Browser), artifacts system, context files, rules/workflows/skills, MCP servers, and building your first project with Anti Gravity.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600">
                      Read on Zenn
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            </motion.article>
          </div>

          {/* Training Videos */}
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>Training Videos</h2>
          </div>
          <div className="mt-6 space-y-12">
            {recordings.map((rec, i) => (
              <motion.article
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold sm:text-2xl" style={{ color: "var(--foreground)" }}>
                    {rec.title}
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                    {new Date(rec.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>

                  <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-black">
                    <iframe
                      src={rec.videoUrl}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <p className="mt-6 leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {rec.description}
                  </p>

                  {rec.topics.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {rec.topics.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
