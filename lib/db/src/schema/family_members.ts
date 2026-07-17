import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const familyMembersTable = pgTable("family_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  photoUrl: text("photo_url"),
  phone: text("phone"),
  isEmergencyContact: boolean("is_emergency_contact").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembersTable).omit({ id: true, createdAt: true });
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembersTable.$inferSelect;
