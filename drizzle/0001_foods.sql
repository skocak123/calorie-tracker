CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"source" text DEFAULT 'custom' NOT NULL,
	"kcal" numeric(6, 1) NOT NULL,
	"protein" numeric(5, 1) NOT NULL,
	"carbs" numeric(5, 1) NOT NULL,
	"fat" numeric(5, 1) NOT NULL,
	"fiber" numeric(5, 1),
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_source_check" CHECK ("foods"."source" in ('custom', 'off', 'nevo')),
	CONSTRAINT "foods_name_length" CHECK (char_length("foods"."name") between 1 and 100),
	CONSTRAINT "foods_kcal_range" CHECK ("foods"."kcal" between 0 and 1000),
	CONSTRAINT "foods_macros_range" CHECK ("foods"."protein" between 0 and 100 and "foods"."carbs" between 0 and 100 and "foods"."fat" between 0 and 100 and ("foods"."fiber" is null or "foods"."fiber" between 0 and 100))
);
--> statement-breakpoint
ALTER TABLE "foods" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Ingelogde gebruikers kunnen alle producten lezen" ON "foods" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen producten aanmaken op eigen naam" ON "foods" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("foods"."created_by" = (select auth.uid()) and "foods"."source" = 'custom');--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen hun eigen producten wijzigen" ON "foods" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("foods"."created_by" = (select auth.uid())) WITH CHECK ("foods"."created_by" = (select auth.uid()) and "foods"."source" = 'custom');--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen hun eigen producten verwijderen" ON "foods" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("foods"."created_by" = (select auth.uid()));--> statement-breakpoint

-- Logged-in users only; RLS decides which rows they may change.
REVOKE ALL ON "foods" FROM anon;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "foods" TO authenticated;
