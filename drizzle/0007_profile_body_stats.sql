ALTER TABLE "profiles" ADD COLUMN "sex" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "height_cm" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weight_kg" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "activity_level" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "goal" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_sex_check" CHECK ("profiles"."sex" in ('male', 'female'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_birth_date_check" CHECK ("profiles"."birth_date" >= '1900-01-01');--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_height_range" CHECK ("profiles"."height_cm" between 100 and 250);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_weight_range" CHECK ("profiles"."weight_kg" between 30 and 300);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_activity_level_check" CHECK ("profiles"."activity_level" in ('sedentary', 'light', 'moderate', 'active', 'very_active'));--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_goal_check" CHECK ("profiles"."goal" in ('cut_fast', 'cut_slow', 'maintain', 'bulk_slow', 'bulk_fast'));--> statement-breakpoint

-- Users may update their own body stats (RLS limits them to their own row).
GRANT UPDATE ("display_name", "sex", "birth_date", "height_cm", "weight_kg", "activity_level", "goal") ON "profiles" TO authenticated;
