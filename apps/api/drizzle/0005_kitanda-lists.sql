ALTER TABLE "platform"."residence_accesses" ADD CONSTRAINT "residence_access_residence_identity" UNIQUE("id","residenceId");
--> statement-breakpoint
CREATE SCHEMA "kitanda";
--> statement-breakpoint
CREATE TABLE "kitanda"."list_shares" (
	"id" uuid PRIMARY KEY NOT NULL,
	"listId" uuid NOT NULL,
	"residenceId" uuid NOT NULL,
	"residenceAccessId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"revokedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kitanda"."lists" (
	"id" uuid PRIMARY KEY NOT NULL,
	"residenceId" uuid NOT NULL,
	"creatorId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_residence_identity" UNIQUE("id","residenceId")
);
--> statement-breakpoint
ALTER TABLE "kitanda"."list_shares" ADD CONSTRAINT "list_shares_listId_residenceId_lists_id_residenceId_fk" FOREIGN KEY ("listId","residenceId") REFERENCES "kitanda"."lists"("id","residenceId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitanda"."list_shares" ADD CONSTRAINT "list_shares_residenceAccessId_residenceId_residence_accesses_id_residenceId_fk" FOREIGN KEY ("residenceAccessId","residenceId") REFERENCES "platform"."residence_accesses"("id","residenceId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitanda"."lists" ADD CONSTRAINT "lists_residenceId_residences_id_fk" FOREIGN KEY ("residenceId") REFERENCES "platform"."residences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitanda"."lists" ADD CONSTRAINT "lists_creatorId_user_id_fk" FOREIGN KEY ("creatorId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "list_share_active" ON "kitanda"."list_shares" USING btree ("listId","residenceAccessId") WHERE "kitanda"."list_shares"."revokedAt" is null;--> statement-breakpoint
CREATE INDEX "list_residence" ON "kitanda"."lists" USING btree ("residenceId");
