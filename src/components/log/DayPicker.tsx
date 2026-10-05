"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/Input";
import { addDays, formatDayLabel } from "@/lib/dates";

type DayPickerProps = {
  date: string;
  today: string;
};

const arrowStyles =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900";

export function DayPicker({ date, today }: DayPickerProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/log?date=${addDays(date, -1)}`} className={arrowStyles} aria-label="Vorige dag">
        ←
      </Link>
      <h1 className="min-w-40 text-center text-2xl font-semibold first-letter:uppercase">
        {formatDayLabel(date, today)}
      </h1>
      <Link href={`/log?date=${addDays(date, 1)}`} className={arrowStyles} aria-label="Volgende dag">
        →
      </Link>

      <Input
        type="date"
        value={date}
        onChange={(event) => {
          if (event.target.value) router.push(`/log?date=${event.target.value}`);
        }}
        aria-label="Kies een datum"
        className="w-auto"
      />

      {date !== today && (
        <Link href="/log" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Naar vandaag
        </Link>
      )}
    </div>
  );
}
