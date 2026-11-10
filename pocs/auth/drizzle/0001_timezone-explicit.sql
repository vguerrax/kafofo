ALTER TABLE "auth_poc"."account" ALTER COLUMN "accessTokenExpiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."account" ALTER COLUMN "refreshTokenExpiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."account" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."account" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."audit" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."audit" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "auth_poc"."session" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."session" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."session" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."user" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."user" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."verification" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."verification" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_poc"."verification" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;