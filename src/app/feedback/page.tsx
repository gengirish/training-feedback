"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "@/components/StarRating";

const paceOptions = ["Too Slow", "Just Right", "Too Fast"];

export default function FeedbackPage() {
  const { data: session, status } = useSession();
  const [registrations, setRegistrations] = useState<{ training_session: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    participant_name: "",
    participant_email: "",
    training_session: "",
    overall_rating: 0,
    content_rating: 0,
    instructor_rating: 0,
    pace_rating: "",
    most_valuable: "",
    least_valuable: "",
    improvement_suggestions: "",
    would_recommend: "",
    additional_comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }
    setForm((prev) => ({
      ...prev,
      participant_name: session.user?.name || "",
      participant_email: session.user?.email || "",
    }));
    setLoading(true);
    fetch("/api/my")
      .then((res) => res.ok ? res.json() : { registrations: [] })
      .then((data) => {
        const regs = data.registrations || [];
        setRegistrations(regs);
        if (regs.length > 0) {
          setForm((prev) => ({
            ...prev,
            participant_name: session.user?.name || "",
            participant_email: session.user?.email || "",
            training_session: regs[0].training_session,
          }));
        }
      })
      .catch((err) => console.error("Failed to load registrations:", err))
      .finally(() => setLoading(false));
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const setRating = (field: string, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.overall_rating === 0 || form.content_rating === 0 || form.instructor_rating === 0) {
      setError("Please provide all star ratings");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Session Feedback</h1>
            <p className="mt-3" style={{ color: "var(--muted)" }}>
              Sign in with your Google account to submit feedback for sessions you&apos;ve registered for.
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

  if (registrations.length === 0) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/30">
              <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Register First</h1>
            <p className="mt-3" style={{ color: "var(--muted)" }}>
              You need to register for a training session before you can submit feedback. Register for a course to get started.
            </p>
            <Link href="/register" className="btn-primary mt-8 inline-block">
              Register for a Session
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const mySessions = [...new Set(registrations.map((r) => r.training_session))];

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
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Thank You for Your Feedback!</h2>
              <p className="mt-3" style={{ color: "var(--muted)" }}>
                Your feedback for <strong>{form.training_session}</strong> has been recorded.
                It helps us improve future sessions.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ ...form, overall_rating: 0, content_rating: 0, instructor_rating: 0, pace_rating: "", most_valuable: "", least_valuable: "", improvement_suggestions: "", would_recommend: "", additional_comments: "" });
                }}
                className="btn-primary mt-8"
              >
                Submit Another
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
                <h1 className="section-title">Session Feedback</h1>
                <p className="section-subtitle">Help us improve by sharing your experience</p>
              </div>

              <form onSubmit={handleSubmit} className="glass-card space-y-6 p-6 sm:p-8">
                {/* Participant Info - read-only for logged-in users */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="participant_name" className="label">Your Name <span className="text-red-500">*</span></label>
                    <input id="participant_name" name="participant_name" required value={form.participant_name} onChange={handleChange} placeholder="John Doe" className="input-field" readOnly />
                  </div>
                  <div>
                    <label htmlFor="participant_email" className="label">Your Email <span className="text-red-500">*</span></label>
                    <input id="participant_email" name="participant_email" type="email" required value={form.participant_email} onChange={handleChange} placeholder="john@example.com" className="input-field" readOnly />
                  </div>
                </div>

                {/* Training Session - only sessions user registered for */}
                <div>
                  <label htmlFor="training_session" className="label">Training Session <span className="text-red-500">*</span></label>
                  <select id="training_session" name="training_session" required value={form.training_session} onChange={handleChange} className="input-field">
                    <option value="">Select the session you attended</option>
                    {mySessions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Star Ratings */}
                <div className="space-y-5 rounded-xl p-5" style={{ background: "var(--input-bg)" }}>
                  <StarRating label="Overall Experience *" value={form.overall_rating} onChange={(v) => setRating("overall_rating", v)} />
                  <StarRating label="Content Quality *" value={form.content_rating} onChange={(v) => setRating("content_rating", v)} />
                  <StarRating label="Instructor Effectiveness *" value={form.instructor_rating} onChange={(v) => setRating("instructor_rating", v)} />
                </div>

                {/* Pace */}
                <div>
                  <label className="label">Training Pace <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-3">
                    {paceOptions.map((opt) => (
                      <label key={opt} className={`cursor-pointer rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${form.pace_rating === opt ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" : "hover:border-primary-300"}`} style={{ borderColor: form.pace_rating === opt ? undefined : "var(--input-border)" }}>
                        <input type="radio" name="pace_rating" value={opt} checked={form.pace_rating === opt} onChange={handleChange} className="sr-only" required />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Text Feedback */}
                <div>
                  <label htmlFor="most_valuable" className="label">Most Valuable Part</label>
                  <textarea id="most_valuable" name="most_valuable" rows={2} value={form.most_valuable} onChange={handleChange} placeholder="What did you find most useful?" className="input-field resize-none" />
                </div>

                <div>
                  <label htmlFor="least_valuable" className="label">Least Valuable Part</label>
                  <textarea id="least_valuable" name="least_valuable" rows={2} value={form.least_valuable} onChange={handleChange} placeholder="What was least helpful?" className="input-field resize-none" />
                </div>

                <div>
                  <label htmlFor="improvement_suggestions" className="label">Suggestions for Improvement</label>
                  <textarea id="improvement_suggestions" name="improvement_suggestions" rows={2} value={form.improvement_suggestions} onChange={handleChange} placeholder="How can we make this better?" className="input-field resize-none" />
                </div>

                {/* Would Recommend */}
                <div>
                  <label className="label">Would you recommend this training? <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    {["Yes", "No", "Maybe"].map((opt) => (
                      <label key={opt} className={`cursor-pointer rounded-xl border px-6 py-2.5 text-sm font-medium transition-all ${form.would_recommend === opt ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" : "hover:border-primary-300"}`} style={{ borderColor: form.would_recommend === opt ? undefined : "var(--input-border)" }}>
                        <input type="radio" name="would_recommend" value={opt} checked={form.would_recommend === opt} onChange={handleChange} className="sr-only" required />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Comments */}
                <div>
                  <label htmlFor="additional_comments" className="label">Additional Comments</label>
                  <textarea id="additional_comments" name="additional_comments" rows={3} value={form.additional_comments} onChange={handleChange} placeholder="Anything else you'd like to share..." className="input-field resize-none" />
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
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
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
