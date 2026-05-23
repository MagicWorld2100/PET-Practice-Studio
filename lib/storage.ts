"use client";

import type { LocalLearningExport, ProgressState } from "@/types/question";

const STORAGE_KEY = "pet-practice-studio-progress-v1";
export const LEARNING_DATA_VERSION = "0.1.3" as const;

export const defaultProgressState: ProgressState = {
  version: LEARNING_DATA_VERSION,
  answers: {},
  listeningReasons: {},
  importedQuestions: [],
  attempts: [],
  sessions: [],
  mockSessions: [],
  parentReports: [],
  settings: {},
  updatedAt: "",
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgressState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgressState;
    return migrateProgress(JSON.parse(raw));
  } catch {
    return defaultProgressState;
  }
}

export function saveProgress(progress: ProgressState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }),
  );
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isLearningExport(value: unknown): value is LocalLearningExport {
  const candidate = value as Partial<LocalLearningExport>;

  return Boolean(
    candidate &&
      candidate.version === LEARNING_DATA_VERSION &&
      Array.isArray(candidate.questionBank) &&
      typeof candidate.answers === "object" &&
      Array.isArray(candidate.attempts) &&
      Array.isArray(candidate.sessions) &&
      Array.isArray(candidate.mockSessions),
  );
}

export function isLegacyLearningExport(value: unknown) {
  const candidate = value as { version?: unknown; bank?: unknown; answers?: unknown; mockSessions?: unknown };
  return Boolean(
    candidate &&
      candidate.version === 1 &&
      Array.isArray(candidate.bank) &&
      typeof candidate.answers === "object" &&
      Array.isArray(candidate.mockSessions),
  );
}

export function migrateProgress(value: unknown): ProgressState {
  const parsed = value as Partial<ProgressState>;

  return {
    ...defaultProgressState,
    ...parsed,
    version: LEARNING_DATA_VERSION,
    answers: safeRecord(parsed.answers),
    listeningReasons: safeRecord(parsed.listeningReasons),
    importedQuestions: Array.isArray(parsed.importedQuestions) ? parsed.importedQuestions : [],
    attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    sessions: Array.isArray(parsed.sessions)
      ? parsed.sessions.map((session) => ({
          ...session,
          objectiveAttemptCount: session.objectiveAttemptCount ?? 0,
        }))
      : [],
    mockSessions: Array.isArray(parsed.mockSessions) ? parsed.mockSessions : [],
    parentReports: Array.isArray(parsed.parentReports) ? parsed.parentReports : [],
    settings: safeRecord(parsed.settings),
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
  };
}

function safeRecord<T = unknown>(value: unknown): Record<string, T> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, T>)
    : {};
}
