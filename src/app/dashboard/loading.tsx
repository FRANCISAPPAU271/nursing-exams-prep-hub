export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}
