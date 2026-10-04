import Link from "next/link";

import { buttonStyles } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold">Calorie Tracker</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Zoek producten op, stel je maaltijden samen en zie per dag hoeveel calorieën, eiwit,
        koolhydraten en vet je binnenkrijgt ten opzichte van je eigen doelen.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className={buttonStyles("primary")}>
          Registreren
        </Link>
        <Link href="/login" className={buttonStyles("secondary")}>
          Inloggen
        </Link>
      </div>
    </main>
  );
}
