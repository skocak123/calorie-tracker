import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

import { saveProfile } from "./actions";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  const defaultValues = {
    sex: profile.sex ?? "",
    birthDate: profile.birth_date ?? "",
    heightCm: profile.height_cm ? String(profile.height_cm) : "",
    weightKg: profile.weight_kg ? String(profile.weight_kg) : "",
    activityLevel: profile.activity_level ?? "",
    goal: profile.goal ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Instellingen</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pas je gegevens aan, bijvoorbeeld als je gewicht verandert. Je plan wordt meteen opnieuw
          berekend.
        </p>
      </div>

      <Card>
        <ProfileForm
          action={saveProfile.bind(null, "settings")}
          defaultValues={defaultValues}
          submitLabel="Opslaan"
        />
      </Card>
    </div>
  );
}
