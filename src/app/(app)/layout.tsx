import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { requireUser } from "@/lib/auth";
import { getProfile, toBodyStats } from "@/lib/profile";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Second check after the proxy.
  const user = await requireUser();

  // New users fill in their body stats first.
  const profile = await getProfile(user.id);
  if (!toBodyStats(profile)) {
    redirect("/onboarding");
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
