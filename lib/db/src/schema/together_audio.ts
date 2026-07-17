import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const togetherAudioTable = pgTable("together_audio", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  uploaderName: text("uploader_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
