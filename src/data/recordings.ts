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
    sessionName: "IntelliForge AI Training",
    title: "Training Video 1",
    description:
      "Watch this training session to learn key concepts and best practices from IntelliForge AI.",
    duration: "",
    videoUrl: "https://www.youtube.com/embed/HKPIRY1fc5s",
    thumbnailUrl: "https://img.youtube.com/vi/HKPIRY1fc5s/maxresdefault.jpg",
    date: "2026-02-26",
    topics: ["Training", "IntelliForge AI"],
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
    topics: ["Training", "IntelliForge AI"],
  },
];

export function getRecordingsForSession(sessionName: string): Recording[] {
  return recordings.filter((r) => r.sessionName === sessionName);
}

export function getAllSessions(): string[] {
  return [...new Set(recordings.map((r) => r.sessionName))];
}
