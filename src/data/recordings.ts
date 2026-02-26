export interface Recording {
  id: string;
  sessionName: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  date: string;
  topics: string[];
}

export const recordings: Recording[] = [
  {
    id: "1",
    sessionName: "AI Product Development Fundamentals",
    title: "Session 1: Introduction to AI Product Thinking",
    description:
      "Understanding AI capabilities, limitations, and how to think about AI as a product builder. Covers the AI product lifecycle and key decision frameworks.",
    duration: "1h 45m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-02-15",
    topics: ["AI Fundamentals", "Product Thinking", "Use Case Identification"],
  },
  {
    id: "2",
    sessionName: "AI Product Development Fundamentals",
    title: "Session 2: Evaluating AI Models & APIs",
    description:
      "How to evaluate different AI models, compare APIs, and choose the right tools for your product requirements. Hands-on comparison exercises.",
    duration: "2h 00m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-02-17",
    topics: ["Model Evaluation", "API Comparison", "Cost Analysis"],
  },
  {
    id: "3",
    sessionName: "Building AI-Powered Applications",
    title: "Session 1: Architecture Patterns for AI Apps",
    description:
      "Learn the most common architecture patterns for AI-powered applications — RAG, fine-tuning, agent-based systems, and when to use each approach.",
    duration: "2h 15m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-02-20",
    topics: ["RAG", "Fine-Tuning", "AI Agents", "Architecture"],
  },
  {
    id: "4",
    sessionName: "Building AI-Powered Applications",
    title: "Session 2: Building Your First AI App (Hands-On)",
    description:
      "Live coding session building an AI-powered application from scratch using Next.js, Vercel AI SDK, and LLM APIs. Deploy to production by end of session.",
    duration: "2h 30m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-02-22",
    topics: ["Next.js", "Vercel AI SDK", "Live Coding", "Deployment"],
  },
  {
    id: "5",
    sessionName: "Prompt Engineering & LLM Integration",
    title: "Session 1: Mastering Prompt Engineering",
    description:
      "Deep dive into prompt engineering techniques — chain of thought, few-shot learning, system prompts, and advanced strategies for reliable AI outputs.",
    duration: "1h 50m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-02-25",
    topics: ["Prompt Engineering", "Chain of Thought", "Few-Shot Learning"],
  },
  {
    id: "6",
    sessionName: "Prompt Engineering & LLM Integration",
    title: "Session 2: Integrating LLMs into Products",
    description:
      "Practical guide to integrating LLMs into real products — handling streaming, error management, rate limiting, caching, and production best practices.",
    duration: "2h 10m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-02-27",
    topics: ["LLM Integration", "Streaming", "Production Best Practices"],
  },
  {
    id: "7",
    sessionName: "Full-Stack AI Development",
    title: "Session 1: Full-Stack AI with Next.js & Python",
    description:
      "Building full-stack AI applications combining Next.js frontend with Python backend services. Database design, API patterns, and authentication.",
    duration: "2h 20m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-03-01",
    topics: ["Full-Stack", "Next.js", "Python", "FastAPI"],
  },
  {
    id: "8",
    sessionName: "AI Product Design & UX",
    title: "Session 1: Designing AI-First User Experiences",
    description:
      "UX patterns for AI products — conversational interfaces, progressive disclosure, handling uncertainty, and building trust with AI-powered features.",
    duration: "1h 40m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-03-05",
    topics: ["UX Design", "Conversational UI", "AI Trust Patterns"],
  },
  {
    id: "9",
    sessionName: "Deploying AI Solutions",
    title: "Session 1: From Development to Production",
    description:
      "End-to-end deployment strategies for AI applications — CI/CD pipelines, monitoring, scaling, cost optimization, and managing AI in production.",
    duration: "2h 00m",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnailUrl: "",
    date: "2026-03-10",
    topics: ["Deployment", "CI/CD", "Monitoring", "Scaling"],
  },
];

export function getRecordingsForSession(sessionName: string): Recording[] {
  return recordings.filter((r) => r.sessionName === sessionName);
}

export function getAllSessions(): string[] {
  return [...new Set(recordings.map((r) => r.sessionName))];
}
