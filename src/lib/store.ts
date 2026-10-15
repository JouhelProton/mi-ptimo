import { useSyncExternalStore } from "react";
import { DEFAULT_ROUTINES, DEFAULT_SETTINGS, type Routines, type Settings } from "./plan";
import { DEFAULT_MENU, type Meal } from "./nutrition";

export type SetLog = { w: string; reps: string; rpe: string; done: boolean };
export type DayLog = {
  sets?: Record<string, SetLog[]>;
  done?: Record<string, boolean>;
  meals?: Record<string, boolean>;
  portion?: Record<string, number>;
  water?: number;
  sleep?: number;
  energy?: number;
  pain?: number;
  note?: string;
  squatClear?: boolean;
};
export type TestEntry = {
  id: string; date: string;
  weight?: number; pullups?: number; pushups2?: number; situps2?: number;
  run2400?: string; swimM?: number; swim457?: string; sleepAvg?: number;
  pain?: string; energy?: number;
};
export type AppState = {
  version: 1;
  settings: Settings;
  routines: Routines;
  menu: Meal[];
  logs: Record<string, DayLog>;
  weights: Record<string, number>;
  tests: TestEntry[];
};

const KEY = "operator-os-v1";
export const defaultState = (): AppState => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  routines: structuredClone(DEFAULT_ROUTINES),
  menu: structuredClone(DEFAULT_MENU),
  logs: {},
  weights: { "2026-10-15": 63.2 },
  tests: [],
});

const SERVER = defaultState();
let state: AppState = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = merge(JSON.parse(raw));
    else state = defaultState();
  } catch {
    state = defaultState();
  }
}
function merge(p: Partial<AppState>): AppState {
  const d = defaultState();
  return { ...d, ...p, settings: { ...d.settings, ...(p.settings || {}) }, routines: p.routines || d.routines, menu: p.menu || d.menu };
}

export function update(fn: (s: AppState) => void) {
  load();
  const next = structuredClone(state);
  fn(next);
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
export function replaceState(s: Partial<AppState>) {
  state = merge(s);
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
export function resetState() {
  replaceState(defaultState());
}
export const getState = () => (load(), state);

export function useApp() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => getState(),
    () => SERVER,
  );
}
export const dayLog = (s: AppState, k: string): DayLog => s.logs[k] || {};
export const editDay = (k: string, fn: (d: DayLog) => void) =>
  update((s) => {
    s.logs[k] ||= {};
    fn(s.logs[k]);
  });
