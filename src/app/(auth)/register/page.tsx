import Link from "next/link";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <Card className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Account aanmaken</h1>

      <RegisterForm />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Heb je al een account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Inloggen
        </Link>
      </p>
    </Card>
  );
}
