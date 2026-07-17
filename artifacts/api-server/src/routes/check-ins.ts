import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, checkInsTable } from "@workspace/db";
import { anthropic } from "../lib/anthropic";
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

Rules:
- NEVER say "Alzheimer's", "dementia", "cognitive decline", or any diagnosis
- If you notice isolation or low mood, gently say "a small change was noticed compared to your usual self — it might be worth sharing with someone you trust, or mentioning to a doctor at your next visit"
- Suggest one concrete, specific action (e.g., "You might enjoy calling your daughter Sarah this week" or "A short walk in the park could be lovely")
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
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullAnalysis += event.delta.text;
        res.write(
          `data: ${JSON.stringify({ content: event.delta.text })}\n\n`
        );
      }
    }

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
