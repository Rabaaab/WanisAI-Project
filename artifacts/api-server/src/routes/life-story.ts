import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, lifeStoryEntriesTable } from "@workspace/db";
import {
  ListLifeStoryEntriesResponse,
  CreateLifeStoryEntryBody,
  CreateLifeStoryEntryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/life-story", async (_req, res): Promise<void> => {
  try {
    const entries = await db
      .select()
      .from(lifeStoryEntriesTable)
      .orderBy(desc(lifeStoryEntriesTable.createdAt));
    res.json(ListLifeStoryEntriesResponse.parse(entries));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch life story entries." });
  }
});

router.post("/life-story/entry", async (req, res): Promise<void> => {
  const parsed = CreateLifeStoryEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [entry] = await db
      .insert(lifeStoryEntriesTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(CreateLifeStoryEntryResponse.parse(entry));
  } catch (err) {
    res.status(500).json({ error: "Failed to create life story entry." });
  }
});

export default router;
