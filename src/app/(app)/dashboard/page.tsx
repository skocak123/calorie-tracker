import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Welkom, {profile?.display_name || "daar"}!</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Hier zie je straks hoe je er vandaag voor staat.
      </p>
    </div>
  );
}
