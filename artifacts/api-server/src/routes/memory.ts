import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, memoryPhotosTable } from "@workspace/db";
import {
  ListMemoryPhotosResponse,
  CreateMemoryPhotoBody,
  CreateMemoryPhotoResponse,
  DeleteMemoryPhotoParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/memory-photos", async (_req, res): Promise<void> => {
  const photos = await db
    .select()
    .from(memoryPhotosTable)
    .orderBy(memoryPhotosTable.createdAt);
  res.json(ListMemoryPhotosResponse.parse(photos));
});

router.post("/memory-photos", async (req, res): Promise<void> => {
  const parsed = CreateMemoryPhotoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [photo] = await db
    .insert(memoryPhotosTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateMemoryPhotoResponse.parse(photo));
});

router.delete("/memory-photos/:id", async (req, res): Promise<void> => {
  const params = DeleteMemoryPhotoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(memoryPhotosTable)
    .where(eq(memoryPhotosTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Memory photo not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
