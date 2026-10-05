import { Card } from "@/components/ui/Card";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {detail && <span className="text-sm text-zinc-600 dark:text-zinc-400">{detail}</span>}
    </Card>
  );
}
