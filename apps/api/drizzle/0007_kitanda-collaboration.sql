CREATE TABLE "kitanda"."mutation_receipts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"action" text NOT NULL,
	"parentId" uuid NOT NULL,
	"key" uuid NOT NULL,
	"fingerprint" text NOT NULL,
	"resourceId" uuid NOT NULL,
	"version" integer,
	"createdAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "receipt_identity" UNIQUE("userId","action","parentId","key")
);
--> statement-breakpoint
ALTER TABLE "kitanda"."items" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "kitanda"."mutation_receipts" ADD CONSTRAINT "mutation_receipts_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "receipt_expiry" ON "kitanda"."mutation_receipts" USING btree ("expiresAt");