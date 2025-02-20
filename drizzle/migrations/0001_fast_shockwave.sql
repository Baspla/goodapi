ALTER TABLE "recommendation_comments" RENAME TO "find_comments";--> statement-breakpoint
ALTER TABLE "recommendation" RENAME TO "find";--> statement-breakpoint
ALTER TABLE "recommendations_to_tags2" RENAME TO "finds_to_tags";--> statement-breakpoint
ALTER TABLE "subscriptions_to_recommendations" RENAME TO "subscriptions_to_finds";--> statement-breakpoint
ALTER TABLE "list_items" RENAME COLUMN "recommendation_id" TO "find_id";--> statement-breakpoint
ALTER TABLE "find_comments" RENAME COLUMN "recommendation_id" TO "find_id";--> statement-breakpoint
ALTER TABLE "finds_to_tags" RENAME COLUMN "recommendation_id" TO "find_id";--> statement-breakpoint
ALTER TABLE "reviews" RENAME COLUMN "recommendation_id" TO "find_id";--> statement-breakpoint
ALTER TABLE "subscriptions_to_finds" RENAME COLUMN "recommendation_id" TO "find_id";--> statement-breakpoint
ALTER TABLE "finds_to_tags" DROP CONSTRAINT "recommendations_to_tags2_recommendation_id_tag_id_unique";--> statement-breakpoint
ALTER TABLE "subscriptions_to_finds" DROP CONSTRAINT "subscriptions_to_recommendations_subscription_id_recommendation_id_unique";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_recommendation_id_recommendation_id_fk";
--> statement-breakpoint
ALTER TABLE "find_comments" DROP CONSTRAINT "recommendation_comments_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "find_comments" DROP CONSTRAINT "recommendation_comments_recommendation_id_recommendation_id_fk";
--> statement-breakpoint
ALTER TABLE "find" DROP CONSTRAINT "recommendation_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "finds_to_tags" DROP CONSTRAINT "recommendations_to_tags2_recommendation_id_recommendation_id_fk";
--> statement-breakpoint
ALTER TABLE "finds_to_tags" DROP CONSTRAINT "recommendations_to_tags2_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_recommendation_id_recommendation_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions_to_finds" DROP CONSTRAINT "subscriptions_to_recommendations_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "subscriptions_to_finds" DROP CONSTRAINT "subscriptions_to_recommendations_recommendation_id_recommendation_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "list_items" ADD CONSTRAINT "list_items_find_id_find_id_fk" FOREIGN KEY ("find_id") REFERENCES "public"."find"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "find_comments" ADD CONSTRAINT "find_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "find_comments" ADD CONSTRAINT "find_comments_find_id_find_id_fk" FOREIGN KEY ("find_id") REFERENCES "public"."find"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "find" ADD CONSTRAINT "find_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "finds_to_tags" ADD CONSTRAINT "finds_to_tags_find_id_find_id_fk" FOREIGN KEY ("find_id") REFERENCES "public"."find"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "finds_to_tags" ADD CONSTRAINT "finds_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reviews" ADD CONSTRAINT "reviews_find_id_find_id_fk" FOREIGN KEY ("find_id") REFERENCES "public"."find"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions_to_finds" ADD CONSTRAINT "subscriptions_to_finds_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions_to_finds" ADD CONSTRAINT "subscriptions_to_finds_find_id_find_id_fk" FOREIGN KEY ("find_id") REFERENCES "public"."find"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "find" DROP COLUMN IF EXISTS "tldr";--> statement-breakpoint
ALTER TABLE "finds_to_tags" ADD CONSTRAINT "finds_to_tags_find_id_tag_id_unique" UNIQUE("find_id","tag_id");--> statement-breakpoint
ALTER TABLE "subscriptions_to_finds" ADD CONSTRAINT "subscriptions_to_finds_subscription_id_find_id_unique" UNIQUE("subscription_id","find_id");