import { prisma } from "./prisma";

export async function addParticipant(data: {
  full_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  job_title?: string | null;
  experience_level?: string | null;
  training_session: string;
  expectations?: string | null;
  referral_source?: string | null;
}) {
  return prisma.participants.create({
    data: {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ?? null,
      organization: data.organization ?? null,
      job_title: data.job_title ?? null,
      experience_level: data.experience_level ?? null,
      training_session: data.training_session,
      expectations: data.expectations ?? null,
      referral_source: data.referral_source ?? null,
    },
  });
}

export async function addFeedback(data: {
  participant_name: string;
  participant_email: string;
  training_session: string;
  overall_rating: number;
  content_rating: number;
  instructor_rating: number;
  pace_rating: string;
  most_valuable?: string | null;
  least_valuable?: string | null;
  improvement_suggestions?: string | null;
  would_recommend: string;
  additional_comments?: string | null;
}) {
  return prisma.feedback.create({
    data: {
      participant_name: data.participant_name,
      participant_email: data.participant_email,
      training_session: data.training_session,
      overall_rating: data.overall_rating,
      content_rating: data.content_rating,
      instructor_rating: data.instructor_rating,
      pace_rating: data.pace_rating,
      most_valuable: data.most_valuable ?? null,
      least_valuable: data.least_valuable ?? null,
      improvement_suggestions: data.improvement_suggestions ?? null,
      would_recommend: data.would_recommend,
      additional_comments: data.additional_comments ?? null,
    },
  });
}

export async function getParticipants() {
  return prisma.participants.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getFeedbacks() {
  return prisma.feedback.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getParticipantsByEmail(email: string) {
  return prisma.participants.findMany({
    where: { email },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function hasRegisteredForSession(email: string, trainingSession: string): Promise<boolean> {
  const rowCount = await prisma.participants.count({
    where: {
      email,
      training_session: trainingSession,
    },
  });
  return rowCount > 0;
}

export async function getFeedbacksByEmail(email: string) {
  return prisma.feedback.findMany({
    where: { participant_email: email },
    orderBy: {
      created_at: "desc",
    },
  });
}

export interface FeedbackRecord {
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
  created_at: Date;
}

export async function getLatestFeedbackByEmailAndSession(email: string, trainingSession: string): Promise<FeedbackRecord | null> {
  return prisma.feedback.findFirst({
    where: {
      participant_email: email,
      training_session: trainingSession,
    },
    orderBy: {
      created_at: "desc",
    },
  });
}

export async function getStats() {
  const [totalParticipants, totalFeedbacks, recommendCount, averages] = await Promise.all([
    prisma.participants.count(),
    prisma.feedback.count(),
    prisma.feedback.count({ where: { would_recommend: "Yes" } }),
    prisma.feedback.aggregate({
      _avg: {
        overall_rating: true,
        content_rating: true,
        instructor_rating: true,
      },
    }),
  ]);

  return {
    totalParticipants,
    totalFeedbacks,
    avgOverallRating: averages._avg.overall_rating ? Number(averages._avg.overall_rating.toFixed(1)) : 0,
    avgContentRating: averages._avg.content_rating ? Number(averages._avg.content_rating.toFixed(1)) : 0,
    avgInstructorRating: averages._avg.instructor_rating ? Number(averages._avg.instructor_rating.toFixed(1)) : 0,
    recommendPercentage: totalFeedbacks > 0 ? Math.round((recommendCount / totalFeedbacks) * 100) : 0,
  };
}
