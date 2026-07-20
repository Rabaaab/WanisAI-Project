import { Router, type IRouter } from "express";
import { desc, eq, and } from "drizzle-orm";
import { db, checkInsTable, messagesTable, memoryPhotosTable, userProfilesTable, familyLettersTable, lifeStoryEntriesTable } from "@workspace/db";
import { gemini } from "../lib/gemini";
import {
  ListCheckInsResponse,
  CreateCheckInBody,
  CreateCheckInResponse,
  GetCheckInParams,
  GetCheckInResponse,
  AnalyzeCheckInParams,
  MarkActionCompleteParams,
  MarkActionCompleteBody,
  MarkActionCompleteResponse,
  GetCheckInDashboardResponse,
  GenerateFamilyLetterBody,
  GenerateFamilyLetterResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/check-ins/dashboard", async (_req, res): Promise<void> => {
  const checkIns = await db
    .select()
    .from(checkInsTable)
    .orderBy(desc(checkInsTable.createdAt))
    .limit(20);

  const recentMoods = checkIns
    .slice(0, 4)
    .map((c) => c.mood ?? "")
    .filter(Boolean);

  const actionsCompleted = checkIns.filter((c) => c.actionCompleted).length;
  const lastCheckIn = checkIns[0];
  const lastCheckInDate = lastCheckIn?.createdAt?.toISOString() ?? null;

  // Simple trend: compare last 2 moods
  let baselineTrend = "stable";
  if (recentMoods.length >= 2) {
    const positive = ["good", "great", "happy", "positive", "content", "well"];
    const last = recentMoods[0].toLowerCase();
    const prev = recentMoods[1].toLowerCase();
    const lastPositive = positive.some((p) => last.includes(p));
    const prevPositive = positive.some((p) => prev.includes(p));
    if (lastPositive && !prevPositive) baselineTrend = "improving";
    else if (!lastPositive && prevPositive) baselineTrend = "needs-attention";
  }

  res.json(
    GetCheckInDashboardResponse.parse({
      totalCheckIns: checkIns.length,
      recentMoods,
      actionsCompleted,
      lastCheckInDate,
      baselineTrend,
    })
  );
});

router.get("/check-ins", async (_req, res): Promise<void> => {
  const checkIns = await db
    .select()
    .from(checkInsTable)
    .orderBy(desc(checkInsTable.createdAt));
  res.json(ListCheckInsResponse.parse(checkIns));
});

router.post("/check-ins", async (req, res): Promise<void> => {
  const parsed = CreateCheckInBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [checkIn] = await db
    .insert(checkInsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateCheckInResponse.parse(checkIn));
});

router.post("/check-ins/family-letter", async (req, res): Promise<void> => {
  const parsed = GenerateFamilyLetterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [profile] = await db.select().from(userProfilesTable).limit(1);
    const name = profile?.name ?? "Friend";

    const checkIns = await db
      .select()
      .from(checkInsTable)
      .orderBy(desc(checkInsTable.createdAt))
      .limit(4);

    const lastMsgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.role, "assistant"))
      .orderBy(desc(messagesTable.createdAt))
      .limit(5);

    const memoryPhotos = await db.select().from(memoryPhotosTable);

    const checkInsContext = checkIns.map(c => `Prompt: ${c.prompt}, Response: ${c.response ?? "None"}, Mood: ${c.mood ?? "Unknown"}, Action Suggested: ${c.actionSuggested ?? "None"}, Completed: ${c.actionCompleted ? "Yes" : "No"}`).join("\n");
    const messagesContext = lastMsgs.map(m => m.content).join("\n");
    const photosContext = memoryPhotos.map(p => `${p.personName} (${p.relationship}): ${p.notes ?? ""}`).join("\n");

    const promptText = `You are Wanis. Write a warm, human, one-paragraph letter to the family of ${name} summarizing how they have seemed this week. Mention one specific thing they talked about, whether they completed their suggested action, and one gentle thing worth the family knowing. Never use clinical language. Write in ${parsed.data.lang}.
    
    Here is the weekly context:
    Name: ${name}
    
    Recent Weekly Reflections:
    ${checkInsContext}
    
    Recent Dialogues with Wanis:
    ${messagesContext}
    
    Loved Ones & Memories:
    ${photosContext}`;

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: "Family letter generation is not configured. Please set GEMINI_API_KEY in the environment." });
      return;
    }

    const geminiRes = await gemini.models.generateContent({
      model: "gemini-flash-latest",
      contents: promptText,
      config: {
        systemInstruction: "You are Wanis, a warm and caring companion who writes letters to family members with gentle updates.",
        maxOutputTokens: 1024,
      }
    });

    const letterContent = geminiRes.text?.trim() ?? '';

    await db
      .insert(familyLettersTable)
      .values({
        content: letterContent,
        lang: parsed.data.lang,
      });

    res.json(GenerateFamilyLetterResponse.parse({ letter: letterContent }));
  } catch (err) {
    req.log.error({ err }, "Error generating family letter");
    res.status(500).json({ error: "Failed to generate family letter. Please try again." });
  }
});

router.get("/check-ins/family-letter", async (req, res): Promise<void> => {
  try {
    const [latestLetter] = await db
      .select()
      .from(familyLettersTable)
      .orderBy(desc(familyLettersTable.createdAt))
      .limit(1);

    res.json(GenerateFamilyLetterResponse.parse({ letter: latestLetter?.content ?? "" }));
  } catch (err) {
    req.log.error({ err }, "Error fetching latest family letter");
    res.status(500).json({ error: "Failed to fetch latest family letter." });
  }
});

router.get("/check-ins/:id", async (req, res): Promise<void> => {
  const params = GetCheckInParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [checkIn] = await db
    .select()
    .from(checkInsTable)
    .where(eq(checkInsTable.id, params.data.id));
  if (!checkIn) {
    res.status(404).json({ error: "Check-in not found" });
    return;
  }
  res.json(GetCheckInResponse.parse(checkIn));
});

router.post("/check-ins/:id/analyze", async (req, res): Promise<void> => {
  const params = AnalyzeCheckInParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [checkIn] = await db
    .select()
    .from(checkInsTable)
    .where(eq(checkInsTable.id, params.data.id));

  if (!checkIn) {
    res.status(404).json({ error: "Check-in not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const systemPrompt = `You are WanisAI — a warm, compassionate cognitive health companion. You are NOT a medical professional and you never diagnose.

Your task: gently analyze the user's weekly reflection to understand their mood and social engagement. Compare gently against what seems like their normal baseline from this reflection alone.

Prevention & Health Context:
While analyzing mood and isolation, also draw context from current lifestyle-intervention prevention research. This "recipe" emphasizes:
- Physical activity (e.g., active movement, walks)
* Nutrition (e.g., balanced meals, hydration)
* Social/cognitive engagement (e.g., learning, social interaction, active conversation)
* Cardiometabolic health (e.g., heart health, general vitality)
Use this evidence-based prevention context to gently inform your analysis and recommendations. Do NOT present this as a score, checklist, or tracker.

Rules:
- NEVER say "Alzheimer's", "dementia", "cognitive decline", or any diagnosis
- If you notice isolation or low mood, gently say "a small change was noticed compared to your usual self — it might be worth sharing with someone you trust, or mentioning to a doctor at your next visit"
- Suggest one concrete, specific action (e.g., "You might enjoy calling your daughter Sarah this week" or "A short walk in the park could be lovely") that draws inspiration from the prevention areas above
- Keep your tone warm, like a kind friend — not clinical
- Keep the response concise (2-3 short paragraphs)
- End with the suggested action clearly labeled

Format:
Reflection: [1-2 sentences on the week]
Mood & Connection: [1 sentence on mood/social signals]
This week's gentle suggestion: [one specific action]`;

  const userMessage = `This week's prompt: "${checkIn.prompt}"

User's reflection: "${checkIn.response ?? "No response provided."}"`;

  let fullAnalysis = "";

  try {
    // Step 1: Read check-in
    res.write(`data: ${JSON.stringify({ status: "reading_checkin" })}\n\n`);
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Compare pattern
    res.write(`data: ${JSON.stringify({ status: "comparing_pattern" })}\n\n`);
    const prevCheckIns = await db
      .select()
      .from(checkInsTable)
      .orderBy(desc(checkInsTable.createdAt))
      .limit(3);
    await new Promise((r) => setTimeout(r, 600));

    // Step 3: Prepare suggestion
    res.write(`data: ${JSON.stringify({ status: "preparing_suggestion" })}\n\n`);

    const stream = await gemini.models.generateContentStream({
      model: "gemini-flash-latest",
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 8192,
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        fullAnalysis += chunk.text;
        res.write(
          `data: ${JSON.stringify({ content: chunk.text })}\n\n`
        );
      }
    }

    res.write(`data: ${JSON.stringify({ status: "verifying" })}\n\n`);
    await new Promise((r) => setTimeout(r, 400));

    // Extract suggested action and mood from the analysis
    const moodMatch = fullAnalysis.match(/Mood & Connection:\s*(.+)/i);
    const actionMatch = fullAnalysis.match(
      /This week['']s gentle suggestion:\s*(.+)/i
    );

    const mood = moodMatch ? moodMatch[1].trim().slice(0, 100) : null;
    const actionSuggested = actionMatch ? actionMatch[1].trim() : null;

    // Save analysis result to DB
    await db
      .update(checkInsTable)
      .set({
        analysisResult: fullAnalysis,
        mood,
        actionSuggested,
      })
      .where(eq(checkInsTable.id, params.data.id));

    // Auto-capture life story entry
    try {
      const cleanText = fullAnalysis.replace(/Reflection:|Mood & Connection:|This week's gentle suggestion:/gi, "").trim();
      const sentenceMatch = cleanText.match(/[^.!?]+[.!?]/);
      const firstSentence = sentenceMatch ? sentenceMatch[0].trim() : cleanText.slice(0, 150).trim();
      
      if (firstSentence) {
        await db.insert(lifeStoryEntriesTable).values({
          source: "checkin",
          content: firstSentence,
        });
      }
    } catch (storyErr) {
      req.log.error({ storyErr }, "Error auto-capturing check-in life story entry");
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error analyzing check-in");
    res.write(
      `data: ${JSON.stringify({ error: "Analysis failed. Please try again." })}\n\n`
    );
    res.end();
  }
});

router.patch("/check-ins/:id/action-complete", async (req, res): Promise<void> => {
  const params = MarkActionCompleteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = MarkActionCompleteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [checkIn] = await db
    .update(checkInsTable)
    .set({ actionCompleted: parsed.data.actionCompleted })
    .where(eq(checkInsTable.id, params.data.id))
    .returning();
  if (!checkIn) {
    res.status(404).json({ error: "Check-in not found" });
    return;
  }
  res.json(MarkActionCompleteResponse.parse(checkIn));
});

export default router;
