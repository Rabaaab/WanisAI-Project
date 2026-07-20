import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorBriefsTable = pgTable("doctor_briefs", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  medicationFindings: text("medication_findings").notNull(),
  checkInSummary: text("check_in_summary").notNull(),
  acbScore: integer("acb_score").notNull().default(0),
  key: text("key").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDoctorBriefSchema = createInsertSchema(doctorBriefsTable).omit({ id: true, createdAt: true });
export type InsertDoctorBrief = z.infer<typeof insertDoctorBriefSchema>;
export type DoctorBrief = typeof doctorBriefsTable.$inferSelect;
