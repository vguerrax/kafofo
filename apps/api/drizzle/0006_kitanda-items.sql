CREATE TABLE "kitanda"."items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"listId" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric(9, 3),
	"unit" text,
	"notes" text,
	"purchased" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "item_quantity_range" CHECK ("kitanda"."items"."quantity" > 0 and "kitanda"."items"."quantity" <= 999999.999)
);
--> statement-breakpoint
ALTER TABLE "kitanda"."items" ADD CONSTRAINT "items_listId_lists_id_fk" FOREIGN KEY ("listId") REFERENCES "kitanda"."lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "item_list_active" ON "kitanda"."items" USING btree ("listId","createdAt","id") WHERE "kitanda"."items"."deletedAt" is null;