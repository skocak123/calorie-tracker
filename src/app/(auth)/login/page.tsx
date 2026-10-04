import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <Card className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Inloggen</h1>

      {error === "bevestiging" && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Automatisch inloggen via de link is niet gelukt. Is je e-mail bevestigd? Log dan
          hieronder in.
        </p>
      )}

      <LoginForm />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Nog geen account?{" "}
        <Link href="/register" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Registreren
        </Link>
      </p>
    </Card>
  );
}
