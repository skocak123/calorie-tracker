ALTER TABLE "foods" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
DROP POLICY "Gebruikers kunnen hun eigen producten verwijderen" ON "foods" CASCADE;--> statement-breakpoint

-- Foods are archived, never deleted.
REVOKE DELETE ON "foods" FROM authenticated;
