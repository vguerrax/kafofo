CREATE TABLE "platform"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."auth_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"events" jsonb NOT NULL,
	"blockedUntil" bigint DEFAULT 0 NOT NULL,
	"expiresAt" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."auth_setup" (
	"id" integer PRIMARY KEY NOT NULL,
	"digest" text,
	"expiresAt" timestamp with time zone,
	"configured" boolean DEFAULT false NOT NULL,
	CONSTRAINT "auth_setup_singleton" CHECK ("platform"."auth_setup"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "platform"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "platform"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"username" text NOT NULL,
	"displayUsername" text,
	"globalAdmin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "username_canonical" CHECK ("platform"."user"."username" ~ '^[a-z0-9._-]{3,30}$')
);
--> statement-breakpoint
CREATE TABLE "platform"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform"."account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "platform"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform"."session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "platform"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "platform"."account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "auth_limits_expiry_idx" ON "platform"."auth_limits" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "platform"."session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_expiry_idx" ON "platform"."session" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "verification_expiry_idx" ON "platform"."verification" USING btree ("expiresAt");