"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validation/schemas";

export type AuthFormState = {
  error?: string;
  success?: string;
  // Refill the form after an error.
  values?: { email?: string; displayName?: string };
};

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = Object.fromEntries(formData);
  const values = { email: String(input.email ?? ""), displayName: String(input.displayName ?? "") };

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, values };
  }

  const { displayName, email, password } = parsed.data;
  const origin = (await headers()).get("origin");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { error: "Kies een sterker wachtwoord.", values };
    }
    return { error: "Registreren is niet gelukt. Probeer het later opnieuw.", values };
  }

  // Same response for existing emails (no account enumeration).
  return { success: "Check je mail om je account te bevestigen." };
}

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const input = Object.fromEntries(formData);
  const values = { email: String(input.email ?? "") };

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Bevestig eerst je e-mailadres via de link in je mail.", values };
    }
    // Don't reveal whether the email exists.
    return { error: "E-mail of wachtwoord onjuist.", values };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
