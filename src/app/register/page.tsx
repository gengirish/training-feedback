"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";

const trainingSessions = [
  "AI Product Development Fundamentals",
  "Building AI-Powered Applications",
  "Prompt Engineering & LLM Integration",
  "Full-Stack AI Development",
  "AI Product Design & UX",
  "Deploying AI Solutions",
];

const experienceLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];

const referralSources = [
  "LinkedIn",
  "Twitter / X",
  "Friend / Colleague",
  "Email Newsletter",
  "Company Training Program",
  "Search Engine",
  "Other",
];

export default function RegisterPage() {
  const { data: session } = useSession();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    job_title: "",
    experience_level: "",
    training_session: "",
    expectations: "",
    referral_source: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        full_name: prev.full_name || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center sm:p-12"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Registration Successful!</h2>
              <p className="mt-3" style={{ color: "var(--muted)" }}>
                Thank you, <strong>{form.full_name}</strong>. You&apos;re registered for <strong>{form.training_session}</strong>.
                We&apos;ll send details to <strong>{form.email}</strong>.
              </p>
              {session && (
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Visit your <a href="/dashboard" className="font-semibold text-primary-600 hover:underline">Learner Dashboard</a> to view recorded sessions.
                </p>
              )}
              <button onClick={() => { setSubmitted(false); setForm({ full_name: session?.user?.name || "", email: session?.user?.email || "", phone: "", organization: "", job_title: "", experience_level: "", training_session: "", expectations: "", referral_source: "" }); }} className="btn-primary mt-8">
                Register Another
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-10 text-center">
                <h1 className="section-title">Participant Registration</h1>
                <p className="section-subtitle">Fill in your details to register for a training session</p>
              </div>

              {/* Google Sign-In */}
              <div className="glass-card mb-6 p-5">
                {session ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {session.user?.image && (
                        <img src={session.user.image} alt="" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />
                      )}
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                          Signed in as {session.user?.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut({ redirect: false })}
                      className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:border-red-400 hover:text-red-600"
                      style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-3 text-sm" style={{ color: "var(--muted)" }}>
                      Sign in with Google to auto-fill your details and access your learner dashboard
                    </p>
                    <button
                      onClick={() => signIn("google")}
                      type="button"
                      className="inline-flex items-center gap-3 rounded-xl border bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98] dark:bg-gray-800 dark:text-gray-200"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-px flex-1" style={{ background: "var(--card-border)" }} />
                      <span className="text-xs" style={{ color: "var(--muted)" }}>or fill in manually</span>
                      <div className="h-px flex-1" style={{ background: "var(--card-border)" }} />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="glass-card space-y-6 p-6 sm:p-8">
                {/* Name & Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="full_name" className="label">Full Name <span className="text-red-500">*</span></label>
                    <input id="full_name" name="full_name" required value={form.full_name} onChange={handleChange} placeholder="John Doe" className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">Email Address <span className="text-red-500">*</span></label>
                    <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="john@example.com" className="input-field" />
                  </div>
                </div>

                {/* Phone & Organization */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="label">Phone Number</label>
                    <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="organization" className="label">Organization</label>
                    <input id="organization" name="organization" value={form.organization} onChange={handleChange} placeholder="Company name" className="input-field" />
                  </div>
                </div>

                {/* Job Title & Experience */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="job_title" className="label">Job Title / Role</label>
                    <input id="job_title" name="job_title" value={form.job_title} onChange={handleChange} placeholder="Software Engineer" className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="experience_level" className="label">Experience Level</label>
                    <select id="experience_level" name="experience_level" value={form.experience_level} onChange={handleChange} className="input-field">
                      <option value="">Select level</option>
                      {experienceLevels.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Training Session */}
                <div>
                  <label htmlFor="training_session" className="label">Training Session <span className="text-red-500">*</span></label>
                  <select id="training_session" name="training_session" required value={form.training_session} onChange={handleChange} className="input-field">
                    <option value="">Select a session</option>
                    {trainingSessions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Expectations */}
                <div>
                  <label htmlFor="expectations" className="label">What do you hope to learn?</label>
                  <textarea id="expectations" name="expectations" rows={3} value={form.expectations} onChange={handleChange} placeholder="Share your expectations for this training..." className="input-field resize-none" />
                </div>

                {/* Referral */}
                <div>
                  <label htmlFor="referral_source" className="label">How did you hear about us?</label>
                  <select id="referral_source" name="referral_source" value={form.referral_source} onChange={handleChange} className="input-field">
                    <option value="">Select option</option>
                    {referralSources.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
                  {submitting ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
