import { ALL_CATEGORIES } from "./exams";

/** Every category across both exam tracks — used by the study task manager. */
export const CATEGORIES = ALL_CATEGORIES;

export const PRIORITIES = ["low", "medium", "high"] as const;
export const STATUSES = ["todo", "in_progress", "done"] as const;

export const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_STYLE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 ring-slate-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  high: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const STATUS_STYLE: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600 ring-slate-200",
  in_progress: "bg-sky-50 text-sky-700 ring-sky-200",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
