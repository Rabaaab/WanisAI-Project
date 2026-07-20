import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, doctorBriefsTable, medicationsTable, checkInsTable, userProfilesTable } from "@workspace/db";
import { gemini } from "../lib/gemini";
import crypto from "crypto";

const router: IRouter = Router();

// POST /api/doctor-briefs
router.post("/doctor-briefs", async (req, res): Promise<void> => {
  try {
    const { isGeminiConfigured } = await import("../lib/gemini");
    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Doctor brief generation is not configured. Please set GEMINI_API_KEY in the environment." });
      return;
    }
    
    // 1. Get profile/patient name
    const [profile] = await db.select().from(userProfilesTable).limit(1);
    const patientName = profile?.name ?? "Patient";

    // 2. Get active medications
    const medications = await db.select().from(medicationsTable);
    const totalAcb = medications.reduce((sum, m) => sum + (m.acbScore || 0), 0);

    const medsSummary = medications
      .map((m) => `- ${m.name} (${m.dosage}, ${m.frequency}) - ACB Burden: ${m.acbScore}`)
      .join("\n");

    const medFindingsPrompt = `Summarize these medication findings for a doctor's brief in plain language, focus on anticholinergic burden:
Total Anticholinergic Cognitive Burden Score: ${totalAcb}
Medications:
${medsSummary || "None logged"}
Provide a clear, brief explanation of which specific medications are contributing to the score and why this matters for dementia/cognitive health, ending with a calm suggestion to discuss this specific finding with their doctor.`;

    let medicationFindings = "No medication findings summary generated.";
    try {
      const medFindingsRes = await gemini.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ role: "user", parts: [{ text: medFindingsPrompt }] }],
      });
      medicationFindings = medFindingsRes.text || medicationFindings;
    } catch (e) {
      req.log.error({ e }, "Gemini med findings failed, using fallback summary");
      const isQuota = (e && ((e as any).status === 429 || (e as any).message?.toString().toLowerCase().includes('quota') || (e as any).message?.toString().toLowerCase().includes('rate limit')));
      if (isQuota) {
        const contributing = medications.filter(m => (m.acbScore || 0) > 0);
        const contribList = contributing.length > 0 ? contributing.map(m => `- ${m.name} (${m.dosage}, ${m.frequency}) — ACB ${m.acbScore}`).join('\n') : 'No medications with anticholinergic burden identified.';
        medicationFindings = `Temporary service limits prevented a detailed AI-generated brief. Based on recorded medications (total ACB: ${totalAcb}):\n${contribList}\n\nIn general, medications with anticholinergic effects can increase risk for confusion and memory problems in older adults. Discuss these findings with a doctor — do not stop medications without medical advice.`;
      } else {
        throw e;
      }
    }

    // 3. Get recent check-ins
    const checkIns = await db
      .select()
      .from(checkInsTable)
      .orderBy(desc(checkInsTable.createdAt))
      .limit(6);

    const checkInsText = checkIns
      .map((c) => {
        const dateStr = c.createdAt instanceof Date
          ? c.createdAt.toDateString()
          : typeof c.createdAt === 'string'
            ? new Date(c.createdAt).toDateString()
            : 'Unknown Date';
        return `- Date: ${dateStr}, Mood: ${c.mood}, Prompt: "${c.prompt}", Response: "${c.response || ""}"`;
      })
      .join("\n");

    const checkInSummaryPrompt = `Provide a concise 1-2 paragraph summary of the patient's recent emotional and cognitive trends based on these check-ins for their doctor:
${checkInsText || "No check-ins logged yet."}
Highlight any patterns, notable improvements, or warnings in mood/engagement. Keep it clinical yet empathetic.`;

    let checkInSummary = "No check-in summary generated.";
    try {
      const checkInSummaryRes = await gemini.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ role: "user", parts: [{ text: checkInSummaryPrompt }] }],
      });
      checkInSummary = checkInSummaryRes.text || checkInSummary;
    } catch (e) {
      req.log.error({ e }, "Gemini check-in summary failed, using fallback summary");
      const isQuota = (e && ((e as any).status === 429 || (e as any).message?.toString().toLowerCase().includes('quota') || (e as any).message?.toString().toLowerCase().includes('rate limit')));
      if (isQuota) {
        const trends = checkIns.map(c => `- ${c.createdAt instanceof Date ? c.createdAt.toDateString() : String(c.createdAt)}: mood=${c.mood}, prompt=${c.prompt}` ).join('\n') || 'No check-ins logged.';
        checkInSummary = `Temporary service limits prevented a detailed AI summary. Recent check-ins:\n${trends}\n\nOverall: review the above patterns with a clinician if you notice worsening mood or disengagement.`;
      } else {
        throw e;
      }
    }

    // 4. Save brief with secure key
    const key = crypto.randomUUID();
    const [brief] = await db
      .insert(doctorBriefsTable)
      .values({
        patientName,
        medicationFindings,
        checkInSummary,
        acbScore: totalAcb,
        key,
      })
      .returning();

    res.status(201).json(brief);
  } catch (err) {
    req.log.error({ err }, "Error generating doctor brief");
    res.status(500).json({ error: "Failed to generate doctor brief" });
  }
});

// GET /api/doctor-briefs/share/:key (Public View Only)
router.get("/doctor-briefs/share/:key", async (req, res): Promise<void> => {
  try {
    const { key } = req.params;
    const [brief] = await db
      .select()
      .from(doctorBriefsTable)
      .where(eq(doctorBriefsTable.key, key))
      .limit(1);

    if (!brief) {
      res.status(404).json({ error: "Brief not found" });
      return;
    }

    res.json(brief);
  } catch (err) {
    req.log.error({ err }, "Error fetching shared doctor brief");
    res.status(500).json({ error: "Failed to fetch shared brief" });
  }
});

export default router;
