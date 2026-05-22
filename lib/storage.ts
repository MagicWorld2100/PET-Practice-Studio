"use client";

import type { ProgressState } from "@/types/question";

const STORAGE_KEY = "pet-practice-studio-progress-v1";

export const defaultProgressState: ProgressState = {
  answers: {},
  listeningReasons: {},
  importedQuestions: [],
  updatedAt: "",
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgressState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgressState;
    return { ...defaultProgressState, ...JSON.parse(raw) } as ProgressState;
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
