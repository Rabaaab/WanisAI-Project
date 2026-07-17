import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, togetherAudioTable } from "@workspace/db";
import {
  ListTogetherAudioResponse,
  CreateTogetherAudioBody,
  CreateTogetherAudioResponse,
  DeleteTogetherAudioParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/together-audio", async (_req, res): Promise<void> => {
  const clips = await db
    .select()
    .from(togetherAudioTable)
    .orderBy(togetherAudioTable.createdAt);
  res.json(ListTogetherAudioResponse.parse(clips));
});

router.post("/together-audio", async (req, res): Promise<void> => {
  const parsed = CreateTogetherAudioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [clip] = await db
    .insert(togetherAudioTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateTogetherAudioResponse.parse(clip));
});

router.delete("/together-audio/:id", async (req, res): Promise<void> => {
  const params = DeleteTogetherAudioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(togetherAudioTable)
    .where(eq(togetherAudioTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Audio clip not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
