import { sql } from "drizzle-orm";
import {
  check,
  numeric,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid, authUsers } from "drizzle-orm/supabase";

// One profile per user, created by a trigger on auth.users.
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    pgPolicy("Gebruikers kunnen hun eigen profiel lezen", {
      for: "select",
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
    }),
    pgPolicy("Gebruikers kunnen hun eigen profiel wijzigen", {
      for: "update",
      to: authenticatedRole,
      using: sql`${table.id} = ${authUid}`,
      withCheck: sql`${table.id} = ${authUid}`,
    }),
  ],
);

// Shared food database: every logged-in user can read all foods,
// only the creator can edit them, and only an admin can archive them. Values are per 100 g.
export const foods = pgTable(
  "foods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    brand: text("brand"),
    source: text("source").notNull().default("custom"),
    kcal: numeric("kcal", { precision: 6, scale: 1 }).notNull(),
    protein: numeric("protein", { precision: 5, scale: 1 }).notNull(),
    carbs: numeric("carbs", { precision: 5, scale: 1 }).notNull(),
    fat: numeric("fat", { precision: 5, scale: 1 }).notNull(),
    fiber: numeric("fiber", { precision: 5, scale: 1 }),
    // Set null (not cascade) so foods stay available when the creator deletes their account.
    createdBy: uuid("created_by").references(() => authUsers.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // Set by an admin instead of deleting, so existing log entries keep working.
    archivedAt: timestamp("archived_at", { withTimezone: true }),
  },
  (table) => [
    check("foods_source_check", sql`${table.source} in ('custom', 'off', 'nevo')`),
    check("foods_name_length", sql`char_length(${table.name}) between 1 and 100`),
    check("foods_kcal_range", sql`${table.kcal} between 0 and 1000`),
    check(
      "foods_macros_range",
      sql`${table.protein} between 0 and 100 and ${table.carbs} between 0 and 100 and ${table.fat} between 0 and 100 and (${table.fiber} is null or ${table.fiber} between 0 and 100)`,
    ),
    pgPolicy("Ingelogde gebruikers kunnen alle producten lezen", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("Gebruikers kunnen producten aanmaken op eigen naam", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.createdBy} = ${authUid} and ${table.source} = 'custom'`,
    }),
    pgPolicy("Gebruikers kunnen hun eigen producten wijzigen", {
      for: "update",
      to: authenticatedRole,
      using: sql`${table.createdBy} = ${authUid}`,
      withCheck: sql`${table.createdBy} = ${authUid} and ${table.source} = 'custom'`,
    }),
  ],
);
