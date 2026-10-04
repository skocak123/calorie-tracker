import { z } from "zod";

const email = z.email("Vul een geldig e-mailadres in.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Vul je wachtwoord in."),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Vul je naam in.")
    .max(50, "Je naam mag maximaal 50 tekens lang zijn."),
  email,
  password: z
    .string()
    .min(8, "Je wachtwoord moet minimaal 8 tekens lang zijn.")
    .max(72, "Je wachtwoord mag maximaal 72 tekens lang zijn."),
});
