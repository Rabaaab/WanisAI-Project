import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lifeStoryEntriesTable = pgTable("life_story_entries", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // 'checkin' | 'conversation' | 'together' | 'manual'
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLifeStoryEntrySchema = createInsertSchema(lifeStoryEntriesTable).omit({ id: true, createdAt: true });
export type InsertLifeStoryEntry = z.infer<typeof insertLifeStoryEntrySchema>;
export type LifeStoryEntry = typeof lifeStoryEntriesTable.$inferSelect;
