import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
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
    // EAN barcode, used to update imported Open Food Facts products.
    barcode: text("barcode").unique(),
    kcal: numeric("kcal", { precision: 6, scale: 1, mode: "number" }).notNull(),
    protein: numeric("protein", { precision: 5, scale: 1, mode: "number" }).notNull(),
    carbs: numeric("carbs", { precision: 5, scale: 1, mode: "number" }).notNull(),
    fat: numeric("fat", { precision: 5, scale: 1, mode: "number" }).notNull(),
    fiber: numeric("fiber", { precision: 5, scale: 1, mode: "number" }),
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

// One line in a user's food diary. Totals are never stored; they are
// calculated from the food's values per 100 g and the grams eaten.
export const logEntries = pgTable(
  "log_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    mealType: text("meal_type").notNull(),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id),
    grams: numeric("grams", { precision: 6, scale: 1, mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("log_entries_user_date_idx").on(table.userId, table.date),
    check(
      "log_entries_meal_type_check",
      sql`${table.mealType} in ('breakfast', 'lunch', 'dinner', 'snack')`,
    ),
    check("log_entries_grams_range", sql`${table.grams} > 0 and ${table.grams} <= 5000`),
    pgPolicy("Gebruikers kunnen hun eigen dagboek lezen", {
      for: "select",
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
    }),
    pgPolicy("Gebruikers kunnen regels aan hun eigen dagboek toevoegen", {
      for: "insert",
      to: authenticatedRole,
      // Archived foods can't be logged anymore.
      withCheck: sql`${table.userId} = ${authUid} and exists (select 1 from ${foods} where ${foods.id} = ${table.foodId} and ${foods.archivedAt} is null)`,
    }),
    pgPolicy("Gebruikers kunnen hun eigen dagboekregels wijzigen", {
      for: "update",
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
      withCheck: sql`${table.userId} = ${authUid}`,
    }),
    pgPolicy("Gebruikers kunnen hun eigen dagboekregels verwijderen", {
      for: "delete",
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
    }),
  ],
);
