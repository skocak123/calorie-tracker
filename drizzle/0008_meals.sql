CREATE TABLE "meal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"grams" numeric(6, 1) NOT NULL,
	CONSTRAINT "meal_items_grams_range" CHECK ("meal_items"."grams" > 0 and "meal_items"."grams" <= 5000)
);
--> statement-breakpoint
ALTER TABLE "meal_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meals_name_length" CHECK (char_length("meals"."name") between 1 and 100)
);
--> statement-breakpoint
ALTER TABLE "meals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "log_entries" ADD COLUMN "meal_name" text;--> statement-breakpoint
ALTER TABLE "log_entries" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Gebruikers beheren de producten van hun eigen maaltijden" ON "meal_items" AS PERMISSIVE FOR ALL TO "authenticated" USING (exists (select 1 from "meals" where "meals"."id" = "meal_items"."meal_id" and "meals"."user_id" = (select auth.uid()))) WITH CHECK (exists (select 1 from "meals" where "meals"."id" = "meal_items"."meal_id" and "meals"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "Gebruikers beheren hun eigen maaltijden" ON "meals" AS PERMISSIVE FOR ALL TO "authenticated" USING ("meals"."user_id" = (select auth.uid())) WITH CHECK ("meals"."user_id" = (select auth.uid()));--> statement-breakpoint

-- Supabase grants everything by default; keep only what the app needs.
REVOKE ALL ON "meals", "meal_items" FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, DELETE ON "meals", "meal_items" TO authenticated;--> statement-breakpoint
GRANT INSERT ("user_id", "name"), UPDATE ("name") ON "meals" TO authenticated;--> statement-breakpoint
GRANT INSERT ("meal_id", "food_id", "grams") ON "meal_items" TO authenticated;--> statement-breakpoint
GRANT INSERT ("meal_name", "group_id") ON "log_entries" TO authenticated;
