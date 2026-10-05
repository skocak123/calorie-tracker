// Grey placeholder rows shown while foods are loading.
export function FoodListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          aria-hidden="true"
          className="flex animate-pulse flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3"
        >
          <div className="flex flex-col gap-2">
            <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-900" />
          </div>
          <div className="flex gap-6">
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-4 w-20 rounded bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-900" />
          </div>
        </li>
      ))}
    </>
  );
}
