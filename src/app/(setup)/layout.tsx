import { signOut } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/auth";

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="font-semibold">Calorie Tracker</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
              Uitloggen
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
