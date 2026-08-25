"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { CATEGORIES, PRIORITIES, PRIORITY_STYLE, STATUSES, STATUS_LABEL, STATUS_STYLE } from "@/lib/constants";

export type Task = {
  id: number;
  title: string;
  notes: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
  targetQuestions: number;
  completed: boolean;
};

type Action =
  | { type: "add"; task: Task }
  | { type: "update"; id: number; patch: Partial<Task> }
  | { type: "delete"; id: number };

const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [, startTransition] = useTransition();
  const [optimistic, applyOptimistic] = useOptimistic(tasks, (state: Task[], action: Action) => {
    switch (action.type) {
      case "add":
        return [action.task, ...state];
      case "update":
        return state.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
      case "delete":
        return state.filter((t) => t.id !== action.id);
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const visible = useMemo(
    () =>
      optimistic.filter(
        (t) =>
          (!filterStatus || t.status === filterStatus) &&
          (!filterCategory || t.category === filterCategory) &&
          (!query || t.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [optimistic, filterStatus, filterCategory, query],
  );

  async function createTask(data: Omit<Task, "id" | "completed">) {
    const temp: Task = { ...data, id: -Date.now(), completed: data.status === "done" };
    startTransition(async () => {
      applyOptimistic({ type: "add", task: temp });
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        setError("Could not create the task.");
        return;
      }
      const { task } = await res.json();
      setTasks((prev) => [normalize(task), ...prev]);
    });
    setShowForm(false);
  }

  async function updateTask(id: number, patch: Partial<Task>) {
    startTransition(async () => {
      applyOptimistic({ type: "update", id, patch });
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setError("Could not update the task.");
        return;
      }
      const { task } = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? normalize(task) : t)));
    });
    setEditing(null);
  }

  async function deleteTask(id: number) {
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Could not delete the task.");
        return;
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Study Tasks</h1>
          <p className="text-sm text-slate-500">
            {optimistic.filter((t) => t.completed).length} of {optimistic.length} complete
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
        >
          + New task
        </button>
      </header>

      {error && (
        <p className="rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>
      )}

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <input
          className={input}
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={input} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select className={input} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {(showForm || editing) && (
        <TaskForm
          initial={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={(data) => (editing ? updateTask(editing.id, data) : createTask(data))}
        />
      )}

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-4xl">🗂️</p>
          <p className="mt-3 font-semibold text-slate-700">No tasks here yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Break your exam prep into focused blocks — content review, question drills, remediation.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {visible.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={(e) => updateTask(t.id, { completed: e.target.checked })}
                className="mt-1 h-5 w-5 accent-teal-600"
              />
              <div className="min-w-0 flex-1">
                <p className={`font-medium ${t.completed ? "text-slate-400 line-through" : ""}`}>{t.title}</p>
                {t.notes && <p className="mt-0.5 text-sm text-slate-500">{t.notes}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                    {t.category}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 capitalize ring-1 ${PRIORITY_STYLE[t.priority]}`}>
                    {t.priority}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 ring-1 ${STATUS_STYLE[t.status]}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                  <span className="text-slate-500">
                    {t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : "No due date"} ·{" "}
                    {t.targetQuestions} Qs
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={t.status}
                  onChange={(e) => updateTask(t.id, { status: e.target.value })}
                  className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditing(t);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function normalize(t: {
  id: number;
  title: string;
  notes: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string | null;
  targetQuestions: number;
  completed: boolean;
}): Task {
  return { ...t, dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null };
}

function TaskForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Task | null;
  onSubmit: (data: Omit<Task, "id" | "completed">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [priority, setPriority] = useState(initial?.priority ?? "medium");
  const [status, setStatus] = useState(initial?.status ?? "todo");
  const [targetQuestions, setTarget] = useState(initial?.targetQuestions ?? 25);
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.slice(0, 10) : "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({
          title: title.trim(),
          notes,
          category,
          priority,
          status,
          targetQuestions: Number(targetQuestions) || 25,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        });
      }}
      className="grid gap-3 rounded-2xl border border-teal-200 bg-teal-50/50 p-5 sm:grid-cols-2"
    >
      <h2 className="text-base font-semibold sm:col-span-2">{initial ? "Edit task" : "New study task"}</h2>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-sm font-medium">Title</span>
        <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1 block text-sm font-medium">Notes</span>
        <textarea className={input} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Category</span>
        <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Priority</span>
        <select className={input} value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Status</span>
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Due date</span>
        <input type="date" className={input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Target questions</span>
        <input
          type="number"
          min={1}
          className={input}
          value={targetQuestions}
          onChange={(e) => setTarget(Number(e.target.value))}
        />
      </label>
      <div className="flex items-end gap-2">
        <button className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          {initial ? "Save changes" : "Create task"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
