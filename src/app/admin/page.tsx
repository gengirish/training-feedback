"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { StarDisplay } from "@/components/StarRating";

interface Participant {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  job_title: string | null;
  experience_level: string | null;
  training_session: string;
  expectations: string | null;
  referral_source: string | null;
  created_at: string;
}

interface Feedback {
  id: number;
  participant_name: string;
  participant_email: string;
  training_session: string;
  overall_rating: number;
  content_rating: number;
  instructor_rating: number;
  pace_rating: string;
  most_valuable: string | null;
  least_valuable: string | null;
  improvement_suggestions: string | null;
  would_recommend: string;
  additional_comments: string | null;
  created_at: string;
}

interface Stats {
  totalParticipants: number;
  totalFeedbacks: number;
  avgOverallRating: number;
  avgContentRating: number;
  avgInstructorRating: number;
  recommendPercentage: number;
}

interface FunnelStats {
  signIns: number;
  registrations: number;
  feedbacks: number;
  certificates: number;
}

type Tab = "overview" | "participants" | "feedback" | "funnel";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [funnel, setFunnel] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user?.isAdmin === true;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, participantsRes, feedbacksRes, funnelRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/participants"),
        fetch("/api/feedback"),
        fetch("/api/admin/funnel"),
      ]);
      setStats(await statsRes.json());
      setParticipants(await participantsRes.json());
      setFeedbacks(await feedbacksRes.json());
      if (funnelRes.ok) setFunnel(await funnelRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [fetchData, isAdmin]);

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

  if (!isAdmin) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Access Restricted</h1>
            <p className="mt-3" style={{ color: "var(--muted)" }}>
              The admin dashboard is only available to authorized administrators.
            </p>
            <Link href="/" className="btn-primary mt-8 inline-flex">Go to Home</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "funnel", label: "Funnel" },
    { id: "participants", label: "Participants" },
    { id: "feedback", label: "Feedback" },
  ];

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="section-title">Dashboard</h1>
              <p className="section-subtitle">View all registrations and feedback</p>
            </div>
            <button onClick={fetchData} className="btn-secondary self-start">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex gap-1 rounded-xl p-1" style={{ background: "var(--input-bg)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id ? "text-primary-600" : ""
                }`}
                style={{ color: activeTab === tab.id ? undefined : "var(--muted)" }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg shadow-sm"
                    style={{ background: "var(--surface)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <>
              {activeTab === "overview" && stats && <OverviewTab stats={stats} />}
              {activeTab === "funnel" && <FunnelTab funnel={funnel} />}
              {activeTab === "participants" && <ParticipantsTab participants={participants} />}
              {activeTab === "feedback" && <FeedbackTab feedbacks={feedbacks} />}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: Stats }) {
  const statCards = [
    { label: "Total Registrations", value: stats.totalParticipants, icon: "users", color: "text-accent-cyan", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
    { label: "Feedback Received", value: stats.totalFeedbacks, icon: "feedback", color: "text-accent-amber", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Avg Overall Rating", value: `${stats.avgOverallRating}/5`, icon: "star", color: "text-accent-purple", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Would Recommend", value: `${stats.recommendPercentage}%`, icon: "thumb", color: "text-accent-green", bg: "bg-green-50 dark:bg-green-900/20" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.bg}`}>
              <StatIcon name={card.icon} className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>{card.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Rating Breakdown</h3>
          <div className="space-y-3">
            <RatingBar label="Overall" value={stats.avgOverallRating} />
            <RatingBar label="Content" value={stats.avgContentRating} />
            <RatingBar label="Instructor" value={stats.avgInstructorRating} />
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Avg Content Rating</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{stats.avgContentRating}/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Avg Instructor Rating</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{stats.avgInstructorRating}/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted)" }}>Recommendation Rate</span>
              <span className="font-semibold text-accent-green">{stats.recommendPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelTab({ funnel }: { funnel: FunnelStats | null }) {
  if (!funnel) {
    return (
      <div className="glass-card py-16 text-center">
        <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>No funnel data yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Events will be tracked automatically as learners register, submit feedback, and generate certificates.
        </p>
      </div>
    );
  }

  const stages = [
    { label: "Registrations", value: funnel.registrations, color: "bg-blue-500" },
    { label: "Feedback Submitted", value: funnel.feedbacks, color: "bg-amber-500" },
    { label: "Certificates Generated", value: funnel.certificates, color: "bg-green-500" },
  ];

  const maxVal = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="mb-6 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Learner Journey Funnel
        </h3>
        <div className="space-y-5">
          {stages.map((stage, i) => {
            const pct = Math.round((stage.value / maxVal) * 100);
            const dropOff = i > 0 && stages[i - 1].value > 0
              ? Math.round(((stages[i - 1].value - stage.value) / stages[i - 1].value) * 100)
              : null;
            return (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {stage.label}
                    </span>
                    {dropOff !== null && dropOff > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        -{dropOff}% drop
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                    {stage.value}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--input-border)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.15 }}
                    className={`h-full rounded-full ${stage.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stages.map((stage, i) => {
          const conversionRate =
            i > 0 && stages[i - 1].value > 0
              ? Math.round((stage.value / stages[i - 1].value) * 100)
              : 100;
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 text-center"
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                {i === 0 ? "Total" : `${stages[i - 1].label} →`}
              </p>
              <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                {conversionRate}%
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                {i === 0 ? "baseline" : "conversion"}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span style={{ color: "var(--muted)" }}>{label}</span>
        <span className="font-medium" style={{ color: "var(--foreground)" }}>{value}/5</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--input-border)" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-primary-500" />
      </div>
    </div>
  );
}

function ParticipantsTab({ participants }: { participants: Participant[] }) {
  if (participants.length === 0) {
    return (
      <div className="glass-card py-16 text-center">
        <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>No registrations yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Participants will appear here once they register.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>Name</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>Email</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>Organization</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>Session</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>Level</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--muted)" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ borderBottom: "1px solid var(--card-border)" }}
                className="hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium" style={{ color: "var(--foreground)" }}>{p.full_name}</td>
                <td className="whitespace-nowrap px-4 py-3" style={{ color: "var(--muted)" }}>{p.email}</td>
                <td className="whitespace-nowrap px-4 py-3" style={{ color: "var(--muted)" }}>{p.organization || "—"}</td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  <span className="inline-block max-w-[200px] truncate">{p.training_session}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {p.experience_level ? (
                    <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {p.experience_level}
                    </span>
                  ) : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackTab({ feedbacks }: { feedbacks: Feedback[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="glass-card py-16 text-center">
        <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>No feedback yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Feedback submissions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((f, i) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold" style={{ color: "var(--foreground)" }}>{f.participant_name}</h3>
              <p className="text-sm" style={{ color: "var(--muted)" }}>{f.participant_email}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{f.training_session}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                f.would_recommend === "Yes"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : f.would_recommend === "No"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}>
                {f.would_recommend === "Yes" ? "Recommends" : f.would_recommend === "No" ? "Does Not Recommend" : "Maybe"}
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {new Date(f.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Overall:</span>
              <StarDisplay value={f.overall_rating} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Content:</span>
              <StarDisplay value={f.content_rating} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Instructor:</span>
              <StarDisplay value={f.instructor_rating} />
            </div>
          </div>

          <div className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
            Pace: <span className="font-medium" style={{ color: "var(--foreground)" }}>{f.pace_rating}</span>
          </div>

          {(f.most_valuable || f.improvement_suggestions || f.additional_comments) && (
            <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: "var(--card-border)" }}>
              {f.most_valuable && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Most Valuable: </span>
                  <span className="text-sm" style={{ color: "var(--foreground)" }}>{f.most_valuable}</span>
                </div>
              )}
              {f.improvement_suggestions && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Suggestions: </span>
                  <span className="text-sm" style={{ color: "var(--foreground)" }}>{f.improvement_suggestions}</span>
                </div>
              )}
              {f.additional_comments && (
                <div>
                  <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Comments: </span>
                  <span className="text-sm" style={{ color: "var(--foreground)" }}>{f.additional_comments}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function StatIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "users":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "feedback":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      );
    case "star":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    case "thumb":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
      );
    default:
      return null;
  }
}
