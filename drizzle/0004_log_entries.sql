CREATE TABLE "log_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"meal_type" text NOT NULL,
	"food_id" uuid NOT NULL,
	"grams" numeric(6, 1) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "log_entries_meal_type_check" CHECK ("log_entries"."meal_type" in ('breakfast', 'lunch', 'dinner', 'snack')),
	CONSTRAINT "log_entries_grams_range" CHECK ("log_entries"."grams" > 0 and "log_entries"."grams" <= 5000)
);
--> statement-breakpoint
ALTER TABLE "log_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "log_entries_user_date_idx" ON "log_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen hun eigen dagboek lezen" ON "log_entries" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("log_entries"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen regels aan hun eigen dagboek toevoegen" ON "log_entries" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("log_entries"."user_id" = (select auth.uid()) and exists (select 1 from "foods" where "foods"."id" = "log_entries"."food_id" and "foods"."archived_at" is null));--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen hun eigen dagboekregels wijzigen" ON "log_entries" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("log_entries"."user_id" = (select auth.uid())) WITH CHECK ("log_entries"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "Gebruikers kunnen hun eigen dagboekregels verwijderen" ON "log_entries" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("log_entries"."user_id" = (select auth.uid()));--> statement-breakpoint

-- Logged-in users only; they can change grams and meal type, nothing else.
REVOKE ALL ON "log_entries" FROM anon;--> statement-breakpoint
GRANT SELECT, DELETE ON "log_entries" TO authenticated;--> statement-breakpoint
GRANT INSERT ("user_id", "date", "meal_type", "food_id", "grams") ON "log_entries" TO authenticated;--> statement-breakpoint
GRANT UPDATE ("meal_type", "grams") ON "log_entries" TO authenticated;
