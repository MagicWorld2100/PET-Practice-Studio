"use client";

import type { LocalLearningExport, ProgressState } from "@/types/question";

const STORAGE_KEY = "pet-practice-studio-progress-v1";

export const defaultProgressState: ProgressState = {
  answers: {},
  listeningReasons: {},
  importedQuestions: [],
  mockSessions: [],
  updatedAt: "",
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgressState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgressState;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...defaultProgressState, ...parsed };
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
      candidate.version === 1 &&
      Array.isArray(candidate.bank) &&
      typeof candidate.answers === "object" &&
      Array.isArray(candidate.mockSessions),
  );
}
