"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarRating } from "@/components/StarRating";

const trainingSessions = [
  "AI Product Development Fundamentals",
  "Building AI-Powered Applications",
  "Prompt Engineering & LLM Integration",
  "Full-Stack AI Development",
  "AI Product Design & UX",
  "Digital Profile Creation",
  "Deploying AI Solutions",
];

const paceOptions = ["Too Slow", "Just Right", "Too Fast"];

export default function FeedbackPage() {
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
                  setForm({ participant_name: "", participant_email: "", training_session: "", overall_rating: 0, content_rating: 0, instructor_rating: 0, pace_rating: "", most_valuable: "", least_valuable: "", improvement_suggestions: "", would_recommend: "", additional_comments: "" });
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
                <h1 className="section-title">Training Feedback</h1>
                <p className="section-subtitle">Help us improve by sharing your experience</p>
              </div>

              <form onSubmit={handleSubmit} className="glass-card space-y-6 p-6 sm:p-8">
                {/* Participant Info */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="participant_name" className="label">Your Name <span className="text-red-500">*</span></label>
                    <input id="participant_name" name="participant_name" required value={form.participant_name} onChange={handleChange} placeholder="John Doe" className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="participant_email" className="label">Your Email <span className="text-red-500">*</span></label>
                    <input id="participant_email" name="participant_email" type="email" required value={form.participant_email} onChange={handleChange} placeholder="john@example.com" className="input-field" />
                  </div>
                </div>

                {/* Training Session */}
                <div>
                  <label htmlFor="training_session" className="label">Training Session <span className="text-red-500">*</span></label>
                  <select id="training_session" name="training_session" required value={form.training_session} onChange={handleChange} className="input-field">
                    <option value="">Select the session you attended</option>
                    {trainingSessions.map((s) => (
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
