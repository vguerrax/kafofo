ALTER TABLE "kitanda"."lists" ADD COLUMN "lifecycleRevision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "kitanda"."lists" ADD COLUMN "deletedAt" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "kitanda"."lists" ADD COLUMN "deletedBy" text;--> statement-breakpoint
ALTER TABLE "kitanda"."lists" ADD CONSTRAINT "lists_deletedBy_user_id_fk" FOREIGN KEY ("deletedBy") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "item_deleted_expiry" ON "kitanda"."items" USING btree ("deletedAt") WHERE "kitanda"."items"."deletedAt" is not null;--> statement-breakpoint
CREATE INDEX "list_deleted_expiry" ON "kitanda"."lists" USING btree ("deletedAt") WHERE "kitanda"."lists"."deletedAt" is not null;