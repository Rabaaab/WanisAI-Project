import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const familyLettersTable = pgTable("family_letters", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  lang: text("lang").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFamilyLetterSchema = createInsertSchema(familyLettersTable).omit({ id: true, createdAt: true });
export type InsertFamilyLetter = z.infer<typeof insertFamilyLetterSchema>;
export type FamilyLetter = typeof familyLettersTable.$inferSelect;
