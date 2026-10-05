"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Dagboek" },
  { href: "/foods", label: "Producten" },
  { href: "/settings", label: "Instellingen" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/dashboard" className="font-semibold">
          Calorie Tracker
        </Link>

        <ul className="flex flex-1 flex-wrap gap-4 text-sm">
          {links.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    isActive
                      ? "font-medium text-emerald-700 dark:text-emerald-400"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <form action={signOut}>
          <Button type="submit" variant="secondary">
            Uitloggen
          </Button>
        </form>
      </nav>
    </header>
  );
}
