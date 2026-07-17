import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const memoryPhotosTable = pgTable("memory_photos", {
  id: serial("id").primaryKey(),
  personName: text("person_name").notNull(),
  relationship: text("relationship").notNull(),
  photoUrl: text("photo_url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMemoryPhotoSchema = createInsertSchema(memoryPhotosTable).omit({ id: true, createdAt: true });
export type InsertMemoryPhoto = z.infer<typeof insertMemoryPhotoSchema>;
export type MemoryPhoto = typeof memoryPhotosTable.$inferSelect;
