import Database from "better-sqlite3";
import path from "path";
import os from "os";

const isVercel = process.env.VERCEL === "1";
const DB_PATH = isVercel
  ? path.join(os.tmpdir(), "training-feedback.db")
  : path.join(process.cwd(), "training-feedback.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      organization TEXT,
      job_title TEXT,
      experience_level TEXT,
      training_session TEXT NOT NULL,
      expectations TEXT,
      referral_source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_name TEXT NOT NULL,
      participant_email TEXT NOT NULL,
      training_session TEXT NOT NULL,
      overall_rating INTEGER NOT NULL CHECK(overall_rating BETWEEN 1 AND 5),
      content_rating INTEGER NOT NULL CHECK(content_rating BETWEEN 1 AND 5),
      instructor_rating INTEGER NOT NULL CHECK(instructor_rating BETWEEN 1 AND 5),
      pace_rating TEXT NOT NULL,
      most_valuable TEXT,
      least_valuable TEXT,
      improvement_suggestions TEXT,
      would_recommend TEXT NOT NULL,
      additional_comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function addParticipant(data: {
  full_name: string;
  email: string;
  phone?: string;
  organization?: string;
  job_title?: string;
  experience_level?: string;
  training_session: string;
  expectations?: string;
  referral_source?: string;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO participants (full_name, email, phone, organization, job_title, experience_level, training_session, expectations, referral_source)
    VALUES (@full_name, @email, @phone, @organization, @job_title, @experience_level, @training_session, @expectations, @referral_source)
  `);
  return stmt.run(data);
}

export function addFeedback(data: {
  participant_name: string;
  participant_email: string;
  training_session: string;
  overall_rating: number;
  content_rating: number;
  instructor_rating: number;
  pace_rating: string;
  most_valuable?: string;
  least_valuable?: string;
  improvement_suggestions?: string;
  would_recommend: string;
  additional_comments?: string;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO feedback (participant_name, participant_email, training_session, overall_rating, content_rating, instructor_rating, pace_rating, most_valuable, least_valuable, improvement_suggestions, would_recommend, additional_comments)
    VALUES (@participant_name, @participant_email, @training_session, @overall_rating, @content_rating, @instructor_rating, @pace_rating, @most_valuable, @least_valuable, @improvement_suggestions, @would_recommend, @additional_comments)
  `);
  return stmt.run(data);
}

export function getParticipants() {
  return getDb().prepare("SELECT * FROM participants ORDER BY created_at DESC").all();
}

export function getFeedbacks() {
  return getDb().prepare("SELECT * FROM feedback ORDER BY created_at DESC").all();
}

export function getStats() {
  const totalParticipants = getDb().prepare("SELECT COUNT(*) as count FROM participants").get() as { count: number };
  const totalFeedbacks = getDb().prepare("SELECT COUNT(*) as count FROM feedback").get() as { count: number };
  const avgOverall = getDb().prepare("SELECT AVG(overall_rating) as avg FROM feedback").get() as { avg: number | null };
  const avgContent = getDb().prepare("SELECT AVG(content_rating) as avg FROM feedback").get() as { avg: number | null };
  const avgInstructor = getDb().prepare("SELECT AVG(instructor_rating) as avg FROM feedback").get() as { avg: number | null };
  const recommendCount = getDb().prepare("SELECT COUNT(*) as count FROM feedback WHERE would_recommend = 'Yes'").get() as { count: number };

  return {
    totalParticipants: totalParticipants.count,
    totalFeedbacks: totalFeedbacks.count,
    avgOverallRating: avgOverall.avg ? Number(avgOverall.avg.toFixed(1)) : 0,
    avgContentRating: avgContent.avg ? Number(avgContent.avg.toFixed(1)) : 0,
    avgInstructorRating: avgInstructor.avg ? Number(avgInstructor.avg.toFixed(1)) : 0,
    recommendPercentage: totalFeedbacks.count > 0 ? Math.round((recommendCount.count / totalFeedbacks.count) * 100) : 0,
  };
}
