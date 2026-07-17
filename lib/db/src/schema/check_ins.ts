import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkInsTable = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  weekOf: text("week_of").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  mood: text("mood"),
  socialEngagement: text("social_engagement"),
  analysisResult: text("analysis_result"),
  actionSuggested: text("action_suggested"),
  actionCompleted: boolean("action_completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCheckInSchema = createInsertSchema(checkInsTable).omit({ id: true, createdAt: true });
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckIn = typeof checkInsTable.$inferSelect;
