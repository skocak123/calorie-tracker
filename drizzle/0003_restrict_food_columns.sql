-- Users may only write these columns. Archiving (archived_at) is admin-only.
REVOKE INSERT, UPDATE ON "foods" FROM authenticated;--> statement-breakpoint
GRANT INSERT ("name", "brand", "kcal", "protein", "carbs", "fat", "fiber", "created_by") ON "foods" TO authenticated;--> statement-breakpoint
GRANT UPDATE ("name", "brand", "kcal", "protein", "carbs", "fat", "fiber") ON "foods" TO authenticated;
