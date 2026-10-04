import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@voorbeeld.nl", password: "geheim" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "geen-email", password: "geheim" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = { displayName: "Selim", email: "test@voorbeeld.nl", password: "12345678" };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("trims the display name", () => {
    const result = registerSchema.parse({ ...valid, displayName: "  Selim  " });
    expect(result.displayName).toBe("Selim");
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(registerSchema.safeParse({ ...valid, password: "1234567" }).success).toBe(false);
  });

  it("rejects empty names and names over 50 characters", () => {
    expect(registerSchema.safeParse({ ...valid, displayName: "   " }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, displayName: "a".repeat(51) }).success).toBe(false);
  });
});
