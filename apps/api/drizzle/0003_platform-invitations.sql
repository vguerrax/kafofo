CREATE TABLE "platform"."invitations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"coreId" uuid NOT NULL,
	"issuerId" text NOT NULL,
	"digest" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"consumedAt" timestamp with time zone,
	"revokedAt" timestamp with time zone,
	CONSTRAINT "invitations_digest_unique" UNIQUE("digest")
);
--> statement-breakpoint
ALTER TABLE "platform"."invitations" ADD CONSTRAINT "invitations_coreId_cores_id_fk" FOREIGN KEY ("coreId") REFERENCES "platform"."cores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."invitations" ADD CONSTRAINT "invitations_issuerId_user_id_fk" FOREIGN KEY ("issuerId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_core" ON "platform"."invitations" USING btree ("coreId");