export type Level = "Beginner" | "Intermediate" | "Advanced";

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
  level: Level;
}

export const recordings: Recording[] = [
  {
    id: "1",
    sessionName: "IntelliForge AI Training",
    title: "Training Video 1",
    description:
      "Watch this training session to learn key concepts and best practices from IntelliForge AI.",
    duration: "",
    videoUrl: "https://www.youtube.com/embed/HKPIRY1fc5s",
    thumbnailUrl: "https://img.youtube.com/vi/HKPIRY1fc5s/maxresdefault.jpg",
    date: "2026-02-26",
    topics: ["AI Fundamentals", "Prompt Engineering"],
    level: "Beginner",
  },
  {
    id: "2",
    sessionName: "IntelliForge AI Training",
    title: "Training Video 2",
    description:
      "Continue your learning with this second training session covering advanced topics.",
    duration: "",
    videoUrl: "https://www.youtube.com/embed/EmbKBdobcWQ",
    thumbnailUrl: "https://img.youtube.com/vi/EmbKBdobcWQ/maxresdefault.jpg",
    date: "2026-02-26",
    topics: ["Agent Development", "Automation"],
    level: "Intermediate",
  },
  {
    id: "3",
    sessionName: "IntelliForge AI Training",
    title: "Training Video 3",
    description:
      "Continue your learning journey with this additional IntelliForge AI training session.",
    duration: "",
    videoUrl: "https://www.youtube.com/embed/GaFFNELfOyo",
    thumbnailUrl: "https://img.youtube.com/vi/GaFFNELfOyo/maxresdefault.jpg",
    date: "2026-02-27",
    topics: ["AI Tools", "Workflow Design"],
    level: "Intermediate",
  },
  {
    id: "4",
    sessionName: "IntelliForge AI Training",
    title: "Training Video 4",
    description:
      "Deepen your understanding with another practical IntelliForge AI learning session.",
    duration: "",
    videoUrl: "https://www.youtube.com/embed/2ZKQKWQmSGA",
    thumbnailUrl: "https://img.youtube.com/vi/2ZKQKWQmSGA/maxresdefault.jpg",
    date: "2026-02-27",
    topics: ["Product Development", "AI Strategy"],
    level: "Advanced",
  },
];

export const allTopics: string[] = [...new Set(recordings.flatMap((r) => r.topics))].sort();
export const allLevels: Level[] = ["Beginner", "Intermediate", "Advanced"];

export function getRecordingsForSession(sessionName: string): Recording[] {
  return recordings.filter((r) => r.sessionName === sessionName);
}

export function getAllSessions(): string[] {
  return [...new Set(recordings.map((r) => r.sessionName))];
}
