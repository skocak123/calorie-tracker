import Link from "next/link";
import { redirect } from "next/navigation";

import { MacroProgress } from "@/components/dashboard/MacroProgress";
import { StatCard } from "@/components/dashboard/StatCard";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { todayISO } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { getLogEntries } from "@/lib/log";
import { macrosForAmount, sumMacros } from "@/lib/nutrition/calculate";
import { GOALS, nutritionPlan } from "@/lib/nutrition/plan";
import { getProfile, toBodyStats } from "@/lib/profile";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const stats = toBodyStats(profile);
  if (!stats) redirect("/onboarding");

  const today = todayISO();
  const plan = nutritionPlan(stats, today);
  const goal = GOALS.find((item) => item.value === stats.goal)!;

  const entries = await getLogEntries(user.id, today);
  const eaten = sumMacros(entries.map((entry) => macrosForAmount(entry.food, entry.grams)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Welkom, {profile.display_name}!</h1>
        <Link href="/log" className={buttonStyles("primary")}>
          Naar dagboek
        </Link>
      </div>

      <Card className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold">Vandaag</h2>
          <p className="text-sm text-zinc-500">
            Doel: {goal.label.toLowerCase()} · {formatNumber(plan.targets.kcal)} kcal per dag
          </p>
        </div>
        <MacroProgress label="Calorieën" value={eaten.kcal} target={plan.targets.kcal} unit="kcal" />
        <MacroProgress label="Eiwit" value={eaten.protein} target={plan.targets.protein} unit="g" />
        <MacroProgress label="Koolhydraten" value={eaten.carbs} target={plan.targets.carbs} unit="g" />
        <MacroProgress label="Vet" value={eaten.fat} target={plan.targets.fat} unit="g" />
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="BMI" value={formatNumber(plan.bmi)} detail={plan.bmiCategory} />
        <StatCard
          label="Rustverbranding"
          value={`${formatNumber(Math.round(plan.bmr))} kcal`}
          detail="Wat je lichaam in rust verbruikt"
        />
        <StatCard
          label="Dagverbruik"
          value={`${formatNumber(Math.round(plan.tdee))} kcal`}
          detail="Inclusief je activiteit"
        />
      </div>

      {plan.hitMinimum && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Je doel is opgehoogd naar het veilige minimum van {formatNumber(plan.targets.kcal)} kcal per
          dag. Minder eten zonder begeleiding wordt afgeraden.
        </p>
      )}

      <p className="text-xs text-zinc-500">
        Schattingen op basis van de Mifflin-St Jeor-formule (marge ongeveer 10%). Klopt je gewicht
        niet meer?{" "}
        <Link href="/settings" className="underline">
          Pas je gegevens aan
        </Link>
        .
      </p>
    </div>
  );
}
