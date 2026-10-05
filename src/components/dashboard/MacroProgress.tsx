import { formatNumber } from "@/lib/format";

type MacroProgressProps = {
  label: string;
  value: number;
  target: number;
  unit: string;
};

export function MacroProgress({ label, value, target, unit }: MacroProgressProps) {
  const percentage = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const remaining = target - value;
  const isOver = remaining < 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-zinc-600 dark:text-zinc-400">
          {formatNumber(Math.round(value))} / {formatNumber(target)} {unit}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={target}
        className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className={`h-full rounded-full ${isOver ? "bg-amber-500" : "bg-emerald-600"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className={`text-xs ${isOver ? "text-amber-700 dark:text-amber-400" : "text-zinc-500"}`}>
        {isOver
          ? `${formatNumber(Math.round(-remaining))} ${unit} erover`
          : `Nog ${formatNumber(Math.round(remaining))} ${unit} te gaan`}
      </p>
    </div>
  );
}
