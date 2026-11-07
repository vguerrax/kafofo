CREATE TABLE "platform"."core_memberships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"coreId" uuid NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"revokedAt" timestamp with time zone,
	CONSTRAINT "membership_core_identity" UNIQUE("id","coreId"),
	CONSTRAINT "membership_role" CHECK ("platform"."core_memberships"."role" in ('admin','member'))
);
--> statement-breakpoint
CREATE TABLE "platform"."cores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."residence_accesses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"coreId" uuid NOT NULL,
	"residenceId" uuid NOT NULL,
	"membershipId" uuid NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"revokedAt" timestamp with time zone,
	CONSTRAINT "residence_access_role" CHECK ("platform"."residence_accesses"."role" in ('responsible','collaborator','viewer'))
);
--> statement-breakpoint
CREATE TABLE "platform"."residences" (
	"id" uuid PRIMARY KEY NOT NULL,
	"coreId" uuid NOT NULL,
	"name" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "residence_core_identity" UNIQUE("id","coreId")
);
--> statement-breakpoint
ALTER TABLE "platform"."core_memberships" ADD CONSTRAINT "core_memberships_coreId_cores_id_fk" FOREIGN KEY ("coreId") REFERENCES "platform"."cores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."core_memberships" ADD CONSTRAINT "core_memberships_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "platform"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."residence_accesses" ADD CONSTRAINT "residence_accesses_membershipId_coreId_core_memberships_id_coreId_fk" FOREIGN KEY ("membershipId","coreId") REFERENCES "platform"."core_memberships"("id","coreId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."residence_accesses" ADD CONSTRAINT "residence_accesses_residenceId_coreId_residences_id_coreId_fk" FOREIGN KEY ("residenceId","coreId") REFERENCES "platform"."residences"("id","coreId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."residences" ADD CONSTRAINT "residences_coreId_cores_id_fk" FOREIGN KEY ("coreId") REFERENCES "platform"."cores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_active" ON "platform"."core_memberships" USING btree ("coreId","userId") WHERE "platform"."core_memberships"."revokedAt" is null;--> statement-breakpoint
CREATE INDEX "membership_user" ON "platform"."core_memberships" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "residence_access_active" ON "platform"."residence_accesses" USING btree ("residenceId","membershipId") WHERE "platform"."residence_accesses"."revokedAt" is null;