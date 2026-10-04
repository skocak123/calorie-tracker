import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { requireEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb() {
  const databaseUrl = requireEnv("DATABASE_URL", process.env.DATABASE_URL);
  const client = postgres(databaseUrl, { prepare: false });

  return drizzle(client, { schema });
}
