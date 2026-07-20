CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" text,
	"photo_url" text,
	"consent_given" boolean DEFAULT false NOT NULL,
	"consent_notes" text,
	"guardian_mode_enabled" boolean DEFAULT false NOT NULL,
	"experience_mode" text DEFAULT 'family' NOT NULL,
	"reminiscence_mode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"relationship" text NOT NULL,
	"photo_url" text,
	"phone" text,
	"is_emergency_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"time" text,
	"frequency" text DEFAULT 'daily' NOT NULL,
	"appointment_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"week_of" text NOT NULL,
	"prompt" text NOT NULL,
	"response" text,
	"mood" text,
	"social_engagement" text,
	"analysis_result" text,
	"action_suggested" text,
	"action_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guardian_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"pilgrim_name" text NOT NULL,
	"pilgrim_photo_url" text,
	"hotel_name" text NOT NULL,
	"hotel_address" text NOT NULL,
	"hotel_phone" text,
	"group_leader_name" text NOT NULL,
	"group_leader_phone" text NOT NULL,
	"medical_notes" text,
	"emergency_note" text,
	"meeting_point_name" text,
	"meeting_point_address" text,
	"emergency_contact_phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_name" text NOT NULL,
	"relationship" text NOT NULL,
	"photo_url" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "together_audio" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"audio_url" text NOT NULL,
	"uploader_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_letters" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"lang" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_story_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"dosage" text NOT NULL,
	"frequency" text NOT NULL,
	"acb_score" integer DEFAULT 0 NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor_briefs" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_name" text NOT NULL,
	"medication_findings" text NOT NULL,
	"check_in_summary" text NOT NULL,
	"acb_score" integer DEFAULT 0 NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "doctor_briefs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;