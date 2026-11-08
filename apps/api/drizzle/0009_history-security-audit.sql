CREATE TABLE "kitanda"."history_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"listId" uuid NOT NULL,
	"action" text NOT NULL,
	"actorId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
	"details" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kitanda"."history_targets" (
	"eventId" uuid NOT NULL,
	"itemId" uuid NOT NULL,
	"details" jsonb,
	"redactedAt" timestamp with time zone,
	CONSTRAINT "history_targets_eventId_itemId_pk" PRIMARY KEY("eventId","itemId")
);
--> statement-breakpoint
CREATE TABLE "platform"."security_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"actorId" text NOT NULL,
	"targetId" text,
	"coreId" uuid NOT NULL,
	"residenceId" uuid,
	"invitationId" uuid,
	"membershipId" uuid,
	"residenceAccessId" uuid,
	"previousRole" text,
	"nextRole" text,
	"createdAt" timestamp with time zone DEFAULT clock_timestamp() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kitanda"."history_events" ADD CONSTRAINT "history_events_listId_lists_id_fk" FOREIGN KEY ("listId") REFERENCES "kitanda"."lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitanda"."history_events" ADD CONSTRAINT "history_events_actorId_user_id_fk" FOREIGN KEY ("actorId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitanda"."history_targets" ADD CONSTRAINT "history_targets_eventId_history_events_id_fk" FOREIGN KEY ("eventId") REFERENCES "kitanda"."history_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."security_events" ADD CONSTRAINT "security_events_actorId_user_id_fk" FOREIGN KEY ("actorId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "history_list_page" ON "kitanda"."history_events" USING btree ("listId","createdAt","id");--> statement-breakpoint
CREATE INDEX "history_target_item" ON "kitanda"."history_targets" USING btree ("itemId");--> statement-breakpoint
CREATE INDEX "security_event_expiry" ON "platform"."security_events" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "security_event_target" ON "platform"."security_events" USING btree ("targetId","createdAt");--> statement-breakpoint
CREATE INDEX "recovery_event_expiry" ON "platform"."recovery_events" USING btree ("createdAt");