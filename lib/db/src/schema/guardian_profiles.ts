import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const guardianProfilesTable = pgTable("guardian_profiles", {
  id: serial("id").primaryKey(),
  pilgrimName: text("pilgrim_name").notNull(),
  pilgrimPhotoUrl: text("pilgrim_photo_url"),
  hotelName: text("hotel_name").notNull(),
  hotelAddress: text("hotel_address").notNull(),
  hotelPhone: text("hotel_phone"),
  groupLeaderName: text("group_leader_name").notNull(),
  groupLeaderPhone: text("group_leader_phone").notNull(),
  medicalNotes: text("medical_notes"),
  emergencyNote: text("emergency_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGuardianProfileSchema = createInsertSchema(guardianProfilesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGuardianProfile = z.infer<typeof insertGuardianProfileSchema>;
export type GuardianProfile = typeof guardianProfilesTable.$inferSelect;
