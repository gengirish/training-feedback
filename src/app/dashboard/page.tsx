"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { StarDisplay } from "@/components/StarRating";
import { recordings, allTopics, allLevels, type Recording, type Level } from "@/data/recordings";

interface Registration {
  id: number;
  full_name: string;
  email: string;
  training_session: string;
  created_at: string;
}

interface Feedback {
  id: number;
  training_session: string;
  overall_rating: number;
  content_rating: number;
  instructor_rating: number;
  pace_rating: string;
  would_recommend: string;
  created_at: string;
}

interface Certificate {
  id: number;
  certificate_id: string;
  training_session: string;
  user_name: string;
  completion_date: string;
  download_count: number;
  generated_at: string;
}

type Tab = "recordings" | "guides" | "registrations" | "feedback";
const validTabs: Tab[] = ["recordings", "guides", "registrations", "feedback"];

type JourneyStage = "new" | "registered" | "feedback_pending" | "certificate_ready" | "complete";

function deriveJourneyStage(registrations: Registration[], feedbacks: Feedback[]): JourneyStage {
  if (registrations.length === 0) return "new";
  const feedbackSessions = new Set(feedbacks.map((f) => f.training_session));
  const allHaveFeedback = registrations.every((r) => feedbackSessions.has(r.training_session));
  const someHaveFeedback = registrations.some((r) => feedbackSessions.has(r.training_session));
  if (allHaveFeedback) return "certificate_ready";
  if (someHaveFeedback) return "feedback_pending";
  return "registered";
}

function smartDefaultTab(registrations: Registration[], feedbacks: Feedback[]): Tab {
  const stage = deriveJourneyStage(registrations, feedbacks);
  switch (stage) {
    case "new":
      return "recordings";
    case "registered":
    case "feedback_pending":
      return "registrations";
    case "certificate_ready":
    case "complete":
      return "registrations";
    default:
      return "recordings";
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("recordings");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<Recording | null>(null);
  const [generatingCertificateFor, setGeneratingCertificateFor] = useState<string | null>(null);
  const [certificateNotice, setCertificateNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mySessionNames = registrations.map((r) => r.training_session);
  const myRecordings = recordings.filter((r) => mySessionNames.includes(r.sessionName));
  const allRecordings = recordings;

  const fetchMyData = useCallback(async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/my");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data.registrations || []);
        setFeedbacks(data.feedbacks || []);
        setCertificates(data.certificates || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchMyData();
  }, [session, fetchMyData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const tabFromUrl = new URLSearchParams(window.location.search).get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl as Tab)) {
      setActiveTab(tabFromUrl as Tab);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab")) return;
    setActiveTab(smartDefaultTab(registrations, feedbacks));
  }, [loading, registrations, feedbacks]);

  useEffect(() => {
    if (!certificateNotice) return;
    const timer = window.setTimeout(() => {
      setCertificateNotice(null);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [certificateNotice]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (typeof window === "undefined") return;
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);
    params.set("tab", tab);
    currentUrl.search = params.toString();
    window.history.replaceState({}, "", currentUrl.toString());
  };

  const handleGenerateCertificate = async (trainingSession: string) => {
    setCertificateNotice(null);
    setGeneratingCertificateFor(trainingSession);
    try {
      const response = await fetch("/api/learner/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ training_session: trainingSession }),
      });

      if (!response.ok) {
        let message = "Failed to generate certificate";
        try {
          const payload = (await response.json()) as { error?: string };
          message = payload.error || message;
        } catch {
          // Keep generic message when non-JSON response is returned.
        }
        throw new Error(message);
      }

      const certId = response.headers.get("X-Certificate-Id");
      const pdfBlob = await response.blob();
      const objectUrl = URL.createObjectURL(pdfBlob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `certificate-${trainingSession.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setCertificateNotice({
        type: "success",
        message: certId
          ? `Certificate downloaded! Verify at /verify/${certId}`
          : `Certificate download started for ${trainingSession}.`,
      });
      fetchMyData();
    } catch (err) {
      setCertificateNotice({
        type: "error",
        message: err instanceof Error ? err.message : "Unable to generate certificate",
      });
    } finally {
      setGeneratingCertificateFor(null);
    }
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Learner Dashboard</h1>
            <p className="mt-3" style={{ color: "var(--muted)" }}>
              Sign in with your Google account to access your registered sessions, recorded training videos, and feedback history.
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

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "recordings", label: "Videos", count: myRecordings.length > 0 ? myRecordings.length : allRecordings.length },
    { id: "guides", label: "Guides" },
    { id: "registrations", label: "My Registrations", count: registrations.length },
    { id: "feedback", label: "My Feedback", count: feedbacks.length },
  ];

  return (
    <div className="py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <Image src={session.user.image} alt="" width={56} height={56} className="h-14 w-14 rounded-full ring-2 ring-primary-500/30 ring-offset-2" style={{ ringOffsetColor: "var(--background)" } as React.CSSProperties} referrerPolicy="no-referrer" />
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                  Welcome, {session.user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{session.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="/register" className="btn-primary text-sm px-5 py-2.5">
                Register for Session
              </a>
              <a href="/feedback" className="btn-secondary text-sm px-5 py-2.5">
                Give Feedback
              </a>
            </div>
          </div>

          {/* Journey Strip */}
          {!loading && (
            <JourneyStrip
              stage={deriveJourneyStage(registrations, feedbacks)}
              registrationCount={registrations.length}
              feedbackCount={feedbacks.length}
              onNavigate={handleTabChange}
            />
          )}

          {/* Nudge Cards */}
          {!loading && (
            <NudgeCards
              registrations={registrations}
              feedbacks={feedbacks}
              certificates={certificates}
            />
          )}

          {/* Recommendations */}
          {!loading && registrations.length > 0 && (
            <RecommendationBlock
              registrations={registrations}
              onPlayVideo={(rec) => {
                fetch("/api/track", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ event: "video_opened", metadata: { video_id: rec.id, title: rec.title, session: rec.sessionName, source: "recommendation" } }),
                }).catch(() => {});
                setActiveVideo(rec);
              }}
            />
          )}

          {/* Tabs */}
          <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl p-1" style={{ background: "var(--input-bg)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id ? "text-primary-600" : ""}`}
                style={{ color: activeTab === tab.id ? undefined : "var(--muted)" }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="dashTab"
                    className="absolute inset-0 rounded-lg shadow-sm"
                    style={{ background: "var(--surface)" }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {certificateNotice ? (
            <div
              className={`mb-4 rounded-xl border p-3 text-sm ${
                certificateNotice.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300"
                  : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {certificateNotice.message}
            </div>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <>
              {activeTab === "recordings" && (
                <RecordingsTab
                  myRecordings={myRecordings}
                  allRecordings={allRecordings}
                  hasRegistrations={registrations.length > 0}
                  activeVideo={activeVideo}
                  onPlayVideo={setActiveVideo}
                  onCloseVideo={() => setActiveVideo(null)}
                />
              )}
              {activeTab === "guides" && <GuidesTab />}
              {activeTab === "registrations" && (
                <RegistrationsTab
                  registrations={registrations}
                  completedSessions={new Set(feedbacks.map((f) => f.training_session))}
                  certificates={certificates}
                  generatingCertificateFor={generatingCertificateFor}
                  onGenerateCertificate={handleGenerateCertificate}
                />
              )}
              {activeTab === "feedback" && <FeedbackTab feedbacks={feedbacks} />}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function RecordingsTab({
  myRecordings,
  allRecordings,
  hasRegistrations,
  activeVideo,
  onPlayVideo,
  onCloseVideo,
}: {
  myRecordings: Recording[];
  allRecordings: Recording[];
  hasRegistrations: boolean;
  activeVideo: Recording | null;
  onPlayVideo: (r: Recording) => void;
  onCloseVideo: () => void;
}) {
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const baseRecordings = hasRegistrations && myRecordings.length > 0 ? myRecordings : allRecordings;
  const displayRecordings = baseRecordings.filter((r) => {
    if (filterTopic !== "all" && !r.topics.includes(filterTopic)) return false;
    if (filterLevel !== "all" && r.level !== filterLevel) return false;
    return true;
  });

  const sessionGroups = displayRecordings.reduce((acc, rec) => {
    if (!acc[rec.sessionName]) acc[rec.sessionName] = [];
    acc[rec.sessionName].push(rec);
    return acc;
  }, {} as Record<string, Recording[]>);

  const handlePlay = (rec: Recording) => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "video_opened", metadata: { video_id: rec.id, title: rec.title, session: rec.sessionName } }),
    }).catch(() => {});
    onPlayVideo(rec);
  };

  const levelColor = (level: Level) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediate": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "Advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Player Modal */}
      {activeVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onCloseVideo}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{activeVideo.title}</h3>
              <button onClick={onCloseVideo} className="rounded-lg p-2 text-white/60 transition-colors hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                src={activeVideo.videoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-sm text-white/60">{activeVideo.description}</p>
          </motion.div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Topic:</span>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: "var(--card-border)", background: "var(--surface)", color: "var(--foreground)" }}
          >
            <option value="all">All Topics</option>
            {allTopics.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>Level:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setFilterLevel("all")}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${filterLevel === "all" ? "bg-primary-600 text-white" : ""}`}
              style={filterLevel !== "all" ? { color: "var(--muted)", background: "var(--input-bg)" } : undefined}
            >
              All
            </button>
            {allLevels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(filterLevel === lvl ? "all" : lvl)}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${filterLevel === lvl ? "bg-primary-600 text-white" : ""}`}
                style={filterLevel !== lvl ? { color: "var(--muted)", background: "var(--input-bg)" } : undefined}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
        {(filterTopic !== "all" || filterLevel !== "all") && (
          <button
            onClick={() => { setFilterTopic("all"); setFilterLevel("all"); }}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {!hasRegistrations && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">No registrations found</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                Showing all available recordings. <a href="/register" className="font-semibold underline">Register for a session</a> to see only your enrolled content.
              </p>
            </div>
          </div>
        </div>
      )}

      {displayRecordings.length === 0 ? (
        <div className="glass-card py-12 text-center">
          <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>No videos match your filters.</p>
          <button
            onClick={() => { setFilterTopic("all"); setFilterLevel("all"); }}
            className="mt-2 text-sm font-medium text-primary-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        Object.entries(sessionGroups).map(([sessionName, recs], gi) => (
          <motion.div
            key={sessionName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.1 }}
          >
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
              {sessionName}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recs.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.1 + i * 0.05 }}
                  className="glass-card group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                  onClick={() => handlePlay(rec)}
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-600 to-accent-purple">
                    {rec.thumbnailUrl ? (
                      <Image
                        src={rec.thumbnailUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm transition-transform group-hover:scale-110">
                        <svg className="h-7 w-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${levelColor(rec.level)}`}>
                        {rec.level}
                      </span>
                    </div>
                    {rec.duration ? (
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                        {rec.duration}
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                      {rec.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>
                      {rec.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {rec.topics.map((t) => (
                        <span key={t} className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px]" style={{ color: "var(--muted)" }}>
                      {new Date(rec.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

function GuidesTab() {
  const guides = [
    {
      title: "How to Set Up and Use Google Antigravity",
      description: "Step-by-step guide to install Google Antigravity on your laptop or system. Learn how to configure the Agent Manager, choose development modes, and build your first project using agent-driven development.",
      href: "https://www.codecademy.com/article/how-to-set-up-and-use-google-antigravity",
      label: "Read guide on Codecademy",
    },
    {
      title: "Anti Gravity Explained: Google's Agent-First Development Platform",
      description: "Deep dive into agent-first development: the three surfaces (Agent Manager, Editor, Browser), artifacts system, context files, rules/workflows/skills, MCP servers, and building your first project with Anti Gravity.",
      href: "https://zenn.dev/neotechpark/articles/578723a5457e76",
      label: "Read on Zenn",
    },
  ];

  return (
    <div className="space-y-4">
      {guides.map((guide, i) => (
        <motion.article
          key={guide.href}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card overflow-hidden"
        >
          <a
            href={guide.href}
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
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {guide.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600">
                  {guide.label}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </motion.article>
      ))}
    </div>
  );
}

function RegistrationsTab({
  registrations,
  completedSessions,
  certificates,
  generatingCertificateFor,
  onGenerateCertificate,
}: {
  registrations: Registration[];
  completedSessions: Set<string>;
  certificates: Certificate[];
  generatingCertificateFor: string | null;
  onGenerateCertificate: (trainingSession: string) => Promise<void>;
}) {
  const certMap = new Map(certificates.map((c) => [c.training_session, c]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(certId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleLinkedIn = (cert: Certificate) => {
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.training_session)}&organizationName=${encodeURIComponent("IntelliForge AI")}&certUrl=${encodeURIComponent(`${window.location.origin}/verify/${cert.certificate_id}`)}&dateMonth=${new Date(cert.completion_date).getMonth() + 1}&dateYear=${new Date(cert.completion_date).getFullYear()}`;
    window.open(url, "_blank", "noopener");
  };

  if (registrations.length === 0) {
    return (
      <div className="glass-card py-16 text-center">
        <svg className="mx-auto mb-4 h-12 w-12" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
        <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>No registrations yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Start by registering for your first training session.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <a href="/register" className="btn-primary text-sm px-5 py-2.5">
            Register for Session
          </a>
          <a href="/dashboard" className="btn-secondary text-sm px-5 py-2.5">
            Explore Learning
          </a>
        </div>
      </div>
    );
  }

  const completedCount = registrations.filter((reg) => completedSessions.has(reg.training_session)).length;
  const pendingCount = registrations.length - completedCount;
  const certCount = certificates.length;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Registered</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: "var(--foreground)" }}>{registrations.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Feedback Done</p>
          <p className="mt-1 text-2xl font-bold text-primary-600">{completedCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Awaiting Feedback</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>Certificates</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{certCount}</p>
        </div>
      </div>

      {registrations.map((reg, i) => {
        const cert = certMap.get(reg.training_session);
        const hasFeedback = completedSessions.has(reg.training_session);
        const isGenerating = generatingCertificateFor === reg.training_session;

        return (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
                  <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{reg.training_session}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    Registered on {new Date(reg.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      1. Registered
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      hasFeedback
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      2. {hasFeedback ? "Feedback Submitted" : "Submit Feedback"}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      cert
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : hasFeedback
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}>
                      3. {cert ? "Certificate Issued" : hasFeedback ? "Certificate Ready" : "Certificate Locked"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Enrolled
                </span>
                <button
                  type="button"
                  onClick={() => onGenerateCertificate(reg.training_session)}
                  disabled={!hasFeedback || isGenerating}
                  className="rounded-lg border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  title={
                    cert
                      ? "Download your certificate again"
                      : hasFeedback
                      ? "Generate and download your certificate"
                      : "Submit feedback after attending to unlock certificate"
                  }
                >
                  {isGenerating
                    ? "Generating..."
                    : cert
                    ? "Download Again"
                    : hasFeedback
                    ? "Generate Certificate"
                    : "Complete Feedback First"}
                </button>
              </div>
            </div>

            {/* Certificate actions bar */}
            {cert && (
              <div
                className="flex flex-wrap items-center gap-3 border-t px-4 py-2.5"
                style={{ borderColor: "var(--card-border)", background: "var(--input-bg)" }}
              >
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                  Generated {new Date(cert.generated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {cert.download_count > 1 && ` · Downloaded ${cert.download_count}x`}
                </span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(cert.certificate_id)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    style={{ color: "var(--foreground)" }}
                    title="Copy verification link"
                  >
                    {copiedId === cert.certificate_id ? (
                      <>
                        <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-6.364-6.364L4.5 8.257" />
                        </svg>
                        Verify Link
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLinkedIn(cert)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[#0A66C2] transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Add to LinkedIn profile"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </button>
                  <a
                    href={`/verify/${cert.certificate_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    style={{ color: "var(--foreground)" }}
                    title="Open verification page"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Verify
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function JourneyStrip({
  stage,
  registrationCount,
  feedbackCount,
  onNavigate,
}: {
  stage: JourneyStage;
  registrationCount: number;
  feedbackCount: number;
  onNavigate: (tab: Tab) => void;
}) {
  const steps: { key: JourneyStage; label: string; done: boolean }[] = [
    { key: "registered", label: "Register", done: registrationCount > 0 },
    { key: "feedback_pending", label: "Give Feedback", done: feedbackCount > 0 },
    { key: "certificate_ready", label: "Get Certificate", done: stage === "complete" },
  ];

  const stageConfig: Record<JourneyStage, { heading: string; sub: string; cta: string; action: () => void }> = {
    new: {
      heading: "Start Your Learning Journey",
      sub: "Register for a training session to get started with videos, feedback, and certificates.",
      cta: "Register Now",
      action: () => { window.location.href = "/register"; },
    },
    registered: {
      heading: "You're Registered!",
      sub: "Attend your session, then submit feedback to unlock your certificate.",
      cta: "Submit Feedback",
      action: () => { window.location.href = "/feedback"; },
    },
    feedback_pending: {
      heading: "Almost There",
      sub: `You have feedback for ${feedbackCount} session${feedbackCount !== 1 ? "s" : ""}. Submit feedback for remaining sessions to unlock all certificates.`,
      cta: "Submit Feedback",
      action: () => { window.location.href = "/feedback"; },
    },
    certificate_ready: {
      heading: "Certificates Ready!",
      sub: "All feedback submitted. Download your certificates from the registrations tab.",
      cta: "View Certificates",
      action: () => onNavigate("registrations"),
    },
    complete: {
      heading: "All Caught Up!",
      sub: "You've completed all sessions and downloaded your certificates.",
      cta: "Explore Videos",
      action: () => onNavigate("recordings"),
    },
  };

  const config = stageConfig[stage];

  const stepColors = (done: boolean) =>
    done
      ? "bg-green-500 text-white"
      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400";

  const lineColor = (done: boolean) =>
    done
      ? "bg-green-500"
      : "bg-gray-200 dark:bg-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-8 overflow-hidden"
    >
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
            {config.heading}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {config.sub}
          </p>

          {/* Progress Steps */}
          <div className="mt-4 flex items-center gap-0">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${stepColors(step.done)}`}>
                    {step.done ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="mt-1 text-[10px] font-medium whitespace-nowrap" style={{ color: "var(--muted)" }}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mx-2 h-0.5 w-8 sm:w-12 ${lineColor(step.done)} rounded-full`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={config.action}
          className="btn-primary shrink-0 self-start px-5 py-2.5 text-sm sm:self-center"
        >
          {config.cta}
        </button>
      </div>
    </motion.div>
  );
}

function NudgeCards({
  registrations,
  feedbacks,
  certificates,
}: {
  registrations: Registration[];
  feedbacks: Feedback[];
  certificates: Certificate[];
}) {
  const feedbackSessions = new Set(feedbacks.map((f) => f.training_session));
  const certSessions = new Set(certificates.map((c) => c.training_session));
  const nudges: { id: string; icon: string; text: string; cta: string; href: string; color: string }[] = [];

  const sessionsWithoutFeedback = registrations.filter((r) => !feedbackSessions.has(r.training_session));
  if (sessionsWithoutFeedback.length > 0) {
    const daysSinceRegistration = Math.floor(
      (Date.now() - new Date(sessionsWithoutFeedback[0].created_at).getTime()) / 86400000
    );
    if (daysSinceRegistration >= 1) {
      nudges.push({
        id: "feedback_pending",
        icon: "feedback",
        text: `You registered ${daysSinceRegistration} day${daysSinceRegistration !== 1 ? "s" : ""} ago for "${sessionsWithoutFeedback[0].training_session}" but haven't submitted feedback yet.`,
        cta: "Submit Feedback",
        href: "/feedback",
        color: "amber",
      });
    }
  }

  const sessionsWithFeedbackNoCert = registrations.filter(
    (r) => feedbackSessions.has(r.training_session) && !certSessions.has(r.training_session)
  );
  if (sessionsWithFeedbackNoCert.length > 0) {
    nudges.push({
      id: "cert_ready",
      icon: "certificate",
      text: `Your certificate for "${sessionsWithFeedbackNoCert[0].training_session}" is ready to download!`,
      cta: "Get Certificate",
      href: "/dashboard?tab=registrations",
      color: "green",
    });
  }

  if (nudges.length === 0) return null;

  const colorMap: Record<string, string> = {
    amber: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
    green: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
  };
  const textColorMap: Record<string, string> = {
    amber: "text-amber-800 dark:text-amber-300",
    green: "text-green-800 dark:text-green-300",
  };

  return (
    <div className="mb-6 space-y-2">
      {nudges.map((nudge) => (
        <motion.div
          key={nudge.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center justify-between gap-4 rounded-xl border p-3 ${colorMap[nudge.color]}`}
        >
          <p className={`text-sm ${textColorMap[nudge.color]}`}>{nudge.text}</p>
          <a
            href={nudge.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${textColorMap[nudge.color]} transition-opacity hover:opacity-80`}
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            {nudge.cta}
          </a>
        </motion.div>
      ))}
    </div>
  );
}

function RecommendationBlock({
  registrations,
  onPlayVideo,
}: {
  registrations: Registration[];
  onPlayVideo: (rec: Recording) => void;
}) {
  const mySessionNames = new Set(registrations.map((r) => r.training_session));
  const myTopics = new Set(
    recordings
      .filter((r) => mySessionNames.has(r.sessionName))
      .flatMap((r) => r.topics)
  );

  const recommended = recordings.filter(
    (r) => !mySessionNames.has(r.sessionName) && r.topics.some((t) => myTopics.has(t))
  );

  const notWatched = recordings.filter(
    (r) => mySessionNames.has(r.sessionName)
  );

  const displayItems = recommended.length > 0 ? recommended : notWatched.slice(0, 2);
  if (displayItems.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
        {recommended.length > 0 ? "Recommended For You" : "Continue Watching"}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {displayItems.map((rec) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card group w-52 shrink-0 cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
            onClick={() => onPlayVideo(rec)}
          >
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary-600 to-accent-purple">
              {rec.thumbnailUrl ? (
                <Image
                  src={rec.thumbnailUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="208px"
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-xs font-semibold leading-snug line-clamp-1" style={{ color: "var(--foreground)" }}>
                {rec.title}
              </h4>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {rec.topics.slice(0, 2).map((t) => (
                  <span key={t} className="rounded-full bg-primary-50 px-1.5 py-0.5 text-[9px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FeedbackTab({ feedbacks }: { feedbacks: Feedback[] }) {
  if (feedbacks.length === 0) {
    return (
      <div className="glass-card py-16 text-center">
        <svg className="mx-auto mb-4 h-12 w-12" style={{ color: "var(--muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>No feedback submitted yet</p>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          <a href="/feedback" className="font-semibold text-primary-600 hover:underline">Share your feedback</a> after attending a session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedbacks.map((fb, i) => (
        <motion.div
          key={fb.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{fb.training_session}</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Submitted on {new Date(fb.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${
              fb.would_recommend === "Yes"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : fb.would_recommend === "No"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}>
              {fb.would_recommend === "Yes" ? "Recommended" : fb.would_recommend === "No" ? "Not Recommended" : "Maybe"}
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Overall:</span>
              <StarDisplay value={fb.overall_rating} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Content:</span>
              <StarDisplay value={fb.content_rating} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--muted)" }}>Instructor:</span>
              <StarDisplay value={fb.instructor_rating} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
