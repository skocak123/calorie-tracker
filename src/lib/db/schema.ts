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
    // Body stats for the nutrition plan; empty until onboarding is done.
    sex: text("sex"),
    birthDate: date("birth_date"),
    heightCm: numeric("height_cm", { precision: 4, scale: 1, mode: "number" }),
    weightKg: numeric("weight_kg", { precision: 4, scale: 1, mode: "number" }),
    activityLevel: text("activity_level"),
    goal: text("goal"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("profiles_sex_check", sql`${table.sex} in ('male', 'female')`),
    check("profiles_birth_date_check", sql`${table.birthDate} >= '1900-01-01'`),
    check("profiles_height_range", sql`${table.heightCm} between 100 and 250`),
    check("profiles_weight_range", sql`${table.weightKg} between 30 and 300`),
    check(
      "profiles_activity_level_check",
      sql`${table.activityLevel} in ('sedentary', 'light', 'moderate', 'active', 'very_active')`,
    ),
    check(
      "profiles_goal_check",
      sql`${table.goal} in ('cut_fast', 'cut_slow', 'maintain', 'bulk_slow', 'bulk_fast')`,
    ),
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

// A user's own saved meal, e.g. "Mijn wrap". Private: only the owner can see it.
export const meals = pgTable(
  "meals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("meals_name_length", sql`char_length(${table.name}) between 1 and 100`),
    pgPolicy("Gebruikers beheren hun eigen maaltijden", {
      for: "all",
      to: authenticatedRole,
      using: sql`${table.userId} = ${authUid}`,
      withCheck: sql`${table.userId} = ${authUid}`,
    }),
  ],
);

// One ingredient of a meal, e.g. 60 g wrap.
export const mealItems = pgTable(
  "meal_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mealId: uuid("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id),
    grams: numeric("grams", { precision: 6, scale: 1, mode: "number" }).notNull(),
  },
  (table) => [
    check("meal_items_grams_range", sql`${table.grams} > 0 and ${table.grams} <= 5000`),
    // Access follows the meal: only the meal's owner can read or change its items.
    pgPolicy("Gebruikers beheren de producten van hun eigen maaltijden", {
      for: "all",
      to: authenticatedRole,
      using: sql`exists (select 1 from ${meals} where ${meals.id} = ${table.mealId} and ${meals.userId} = ${authUid})`,
      withCheck: sql`exists (select 1 from ${meals} where ${meals.id} = ${table.mealId} and ${meals.userId} = ${authUid})`,
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
    // Set when the line was logged as part of a meal; lines of one meal share a group id.
    mealName: text("meal_name"),
    groupId: uuid("group_id"),
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
