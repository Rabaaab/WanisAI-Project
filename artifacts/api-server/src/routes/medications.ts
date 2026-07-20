import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, medicationsTable } from "@workspace/db";
import { gemini } from "../lib/gemini";
import { z } from "zod";
import { getAcbScore } from "../lib/acb-reference";
import fs from "fs";
import path from "path";

const router: IRouter = Router();
type Medication = typeof medicationsTable.$inferSelect;

// GET /api/medications
router.get("/medications", async (req, res): Promise<void> => {
  try {
    const meds = await db
      .select()
      .from(medicationsTable)
      .orderBy(desc(medicationsTable.createdAt));
    res.json(meds);
  } catch (err) {
    req.log.error({ err }, "Error fetching medications");
    res.status(500).json({ error: "Failed to fetch medications" });
  }
});

// POST /api/medications
const addMedSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  reason: z.string().optional(),
});

router.post("/medications", async (req, res): Promise<void> => {
  try {
    const parsed = addMedSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error });
      return;
    }

    const { name, dosage, frequency, reason } = parsed.data;
    const acbScore = getAcbScore(name);

    const [newMed] = await db
      .insert(medicationsTable)
      .values({
        name,
        dosage,
        frequency,
        acbScore,
        reason,
      })
      .returning();

    res.status(201).json(newMed);
  } catch (err) {
    req.log.error({ err }, "Error adding medication");
    res.status(500).json({ error: "Failed to add medication" });
  }
});

// DELETE /api/medications/:id
router.delete("/medications/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID format" });
      return;
    }

    const [deleted] = await db
      .delete(medicationsTable)
      .where(eq(medicationsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Medication not found" });
      return;
    }

    res.json(deleted);
  } catch (err) {
    req.log.error({ err }, "Error deleting medication");
    res.status(500).json({ error: "Failed to delete medication" });
  }
});

// POST /api/medications/extract-vision
const extractVisionSchema = z.object({
  imageUrl: z.string(),
});

import { ObjectStorageService } from "../lib/objectStorage";
const objectStorageService = new ObjectStorageService();

router.post("/medications/extract-vision", async (req, res): Promise<void> => {
  try {
    const { isGeminiConfigured } = await import("../lib/gemini");
    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Medication vision extraction is not configured. Please set GEMINI_API_KEY in the environment." });
      return;
    }
    
    const parsed = extractVisionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error });
      return;
    }

    let base64 = "";
    let mimeType = "image/jpeg";

    if (parsed.data.imageUrl.startsWith("/objects/")) {
      if (!process.env.REPLIT_ENV) {
        const objectId = parsed.data.imageUrl.replace(/^\/objects\//, "");
        const localFilePath = path.join(process.cwd(), 'local_storage', objectId);
        if (fs.existsSync(localFilePath)) {
          const buffer = fs.readFileSync(localFilePath);
          base64 = buffer.toString("base64");
          mimeType = "image/jpeg";
        } else {
          throw new Error("Local file not found: " + localFilePath);
        }
      } else {
        const objectFile = await objectStorageService.getObjectEntityFile(parsed.data.imageUrl);
        const response = await objectStorageService.downloadObject(objectFile);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64 = buffer.toString("base64");
        mimeType = response.headers.get("content-type") || mimeType;
      }
    } else if (parsed.data.imageUrl.startsWith("/")) {
      const publicPath = path.join(process.cwd(), "..", "wanis-ai", "public", parsed.data.imageUrl.slice(1));
      if (fs.existsSync(publicPath)) {
        const buffer = fs.readFileSync(publicPath);
        base64 = buffer.toString("base64");
        mimeType = "image/png";
      } else {
        throw new Error("Relative file not found: " + publicPath);
      }
    } else {
      const imageRes = await fetch(parsed.data.imageUrl);
      const arrayBuffer = await imageRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64 = buffer.toString("base64");
      mimeType = imageRes.headers.get("content-type") || mimeType;
    }

    const prompt = `Analyze this image of a medication or pill bottle. Extract the following information as a JSON object:
- "name": The name of the medication (generic or brand).
- "dosage": The dosage (e.g. 10mg).
- "frequency": The frequency (e.g. Daily, As needed).
If you cannot find a field, return an empty string for it. Return ONLY valid JSON.`;

    const response = await gemini.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64,
                mimeType,
              },
            },
          ],
        },
      ],
    });

    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    let extracted;
    try {
      extracted = JSON.parse(rawText);
    } catch (e) {
      extracted = { name: "Unknown", dosage: "Unknown", frequency: "Unknown" };
    }

    const acbScore = getAcbScore(extracted.name || "");

    res.json({
      name: extracted.name || "",
      dosage: extracted.dosage || "",
      frequency: extracted.frequency || "",
      acbScore,
    });
  } catch (err) {
    req.log.error({ err }, "Error extracting medication via vision");
    res.status(500).json({ error: "Failed to extract medication from image" });
  }
});

// POST /api/medications/analyze
router.post("/medications/analyze", async (req, res): Promise<void> => {
  try {
    const { isGeminiConfigured } = await import("../lib/gemini");
    if (!isGeminiConfigured()) {
      res.status(503).json({ error: "Medication analysis is not configured. Please set GEMINI_API_KEY in the environment." });
      return;
    }
    
    const meds = await db.select().from(medicationsTable);
    if (meds.length === 0) {
      res.json({ explanation: "No medications logged to analyze." });
      return;
    }

    const totalAcb = meds.reduce((sum: number, m: Medication) => sum + m.acbScore, 0);

    const medsList = meds.map((m: Medication) => `- ${m.name} (ACB: ${m.acbScore})`).join("\n");

    const prompt = `You are a cognitive health assistant. Analyze the following medication list for an older adult. 
The total Anticholinergic Cognitive Burden (ACB) score is ${totalAcb}.
Medications:
${medsList}

Provide a non-alarming, plain-language explanation of which specific medications are contributing to the cognitive burden score and why this matters for dementia or cognitive health. Explain the concept of "anticholinergic burden" simply. 
End the explanation with a calm suggestion to discuss this specific finding with their doctor, and explicitly state that they should NEVER stop or change a medication without medical supervision.`;

    try {
      const response = await gemini.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      res.json({ explanation: response.text || "No explanation generated." });
    } catch (e) {
      req.log.error({ e }, "Gemini analyze call failed, falling back to template response");
      const isQuota = (e && ((e as any).status === 429 || (e as any).message?.toString().toLowerCase().includes('quota') || (e as any).message?.toString().toLowerCase().includes('rate limit')));
      if (isQuota) {
        const contributing = meds.filter((m: Medication) => m.acbScore && m.acbScore > 0);
        const contribList = contributing.length > 0 ? contributing.map((m: Medication) => `- ${m.name} (${m.dosage}, ${m.frequency}) — ACB ${m.acbScore}`).join('\n') : 'No medications with anticholinergic burden were identified.';
        const explanation = `I couldn't reach the external analysis service due to temporary service limits. Based on the medications we have recorded (total ACB score: ${totalAcb}):\n${contribList}\n\nIn plain terms: medications with anticholinergic properties can increase confusion and memory problems in some older adults. This list highlights medicines that may contribute to that burden. Please review these findings with a doctor — do NOT stop or change any medication without medical advice.`;
        res.json({ explanation });
        return;
      }

      res.status(500).json({ error: "Failed to analyze medications" });
      return;
    }
  } catch (err) {
    req.log.error({ err }, "Error analyzing medications");
    res.status(500).json({ error: "Failed to analyze medications" });
  }
});

export default router;
