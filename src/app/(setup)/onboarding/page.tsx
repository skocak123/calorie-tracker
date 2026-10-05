import { saveProfile } from "@/app/(app)/settings/actions";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/profile";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Welkom, {profile.display_name}!</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Vertel iets over jezelf. Daarmee berekenen we je BMI, je verbruik en hoeveel je per dag
          moet eten voor jouw doel.
        </p>
      </div>

      <Card>
        <ProfileForm action={saveProfile.bind(null, "onboarding")} submitLabel="Bereken mijn plan" />
      </Card>
    </div>
  );
}
