-- Supabase grants all privileges on new tables by default.
-- Revoke everything and grant back only what the app needs.
REVOKE ALL ON "profiles", "foods", "log_entries" FROM anon, authenticated;--> statement-breakpoint

GRANT SELECT ON "profiles" TO authenticated;--> statement-breakpoint
GRANT UPDATE ("display_name") ON "profiles" TO authenticated;--> statement-breakpoint

GRANT SELECT ON "foods" TO authenticated;--> statement-breakpoint
GRANT INSERT ("name", "brand", "kcal", "protein", "carbs", "fat", "fiber", "created_by") ON "foods" TO authenticated;--> statement-breakpoint
GRANT UPDATE ("name", "brand", "kcal", "protein", "carbs", "fat", "fiber") ON "foods" TO authenticated;--> statement-breakpoint

GRANT SELECT, DELETE ON "log_entries" TO authenticated;--> statement-breakpoint
GRANT INSERT ("user_id", "date", "meal_type", "food_id", "grams") ON "log_entries" TO authenticated;--> statement-breakpoint
GRANT UPDATE ("meal_type", "grams") ON "log_entries" TO authenticated;
