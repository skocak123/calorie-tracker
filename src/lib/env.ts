export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Omgevingsvariabele ${name} ontbreekt. Vul hem in .env.local in (zie .env.example).`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string {
  return requireEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
