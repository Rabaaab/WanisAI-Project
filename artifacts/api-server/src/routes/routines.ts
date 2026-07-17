import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, routinesTable } from "@workspace/db";
import {
  ListRoutinesResponse,
  CreateRoutineBody,
  CreateRoutineResponse,
  UpdateRoutineParams,
  UpdateRoutineBody,
  UpdateRoutineResponse,
  DeleteRoutineParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/routines", async (_req, res): Promise<void> => {
  const routines = await db
    .select()
    .from(routinesTable)
    .orderBy(routinesTable.createdAt);
  res.json(ListRoutinesResponse.parse(routines));
});

router.post("/routines", async (req, res): Promise<void> => {
  const parsed = CreateRoutineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [routine] = await db
    .insert(routinesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateRoutineResponse.parse(routine));
});

router.patch("/routines/:id", async (req, res): Promise<void> => {
  const params = UpdateRoutineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateRoutineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [routine] = await db
    .update(routinesTable)
    .set(parsed.data)
    .where(eq(routinesTable.id, params.data.id))
    .returning();
  if (!routine) {
    res.status(404).json({ error: "Routine not found" });
    return;
  }
  res.json(UpdateRoutineResponse.parse(routine));
});

router.delete("/routines/:id", async (req, res): Promise<void> => {
  const params = DeleteRoutineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(routinesTable)
    .where(eq(routinesTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Routine not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
