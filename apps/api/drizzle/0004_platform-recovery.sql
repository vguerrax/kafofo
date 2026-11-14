CREATE TABLE "platform"."password_recoveries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"digest" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"revokedAt" timestamp with time zone,
	"consumedAt" timestamp with time zone,
	"failures" integer DEFAULT 0 NOT NULL,
	"channel" text NOT NULL,
	CONSTRAINT "password_recoveries_digest_unique" UNIQUE("digest"),
	CONSTRAINT "recovery_failures" CHECK ("platform"."password_recoveries"."failures" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "platform"."recovery_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"actor" text NOT NULL,
	"target" text NOT NULL,
	"channel" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform"."password_recoveries" ADD CONSTRAINT "password_recoveries_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."recovery_events" ADD CONSTRAINT "recovery_events_target_user_id_fk" FOREIGN KEY ("target") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recovery_user" ON "platform"."password_recoveries" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "recovery_event_target" ON "platform"."recovery_events" USING btree ("target");