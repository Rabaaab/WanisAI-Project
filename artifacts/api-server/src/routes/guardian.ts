import { Router, type IRouter } from "express";
import { db, guardianProfilesTable } from "@workspace/db";
import {
  GetGuardianProfileResponse,
  UpsertGuardianProfileBody,
  UpsertGuardianProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/guardian-profile", async (req, res): Promise<void> => {
  const [profile] = await db.select().from(guardianProfilesTable).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Guardian profile not found" });
    return;
  }
  res.json(GetGuardianProfileResponse.parse(profile));
});

router.put("/guardian-profile", async (req, res): Promise<void> => {
  const parsed = UpsertGuardianProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(guardianProfilesTable).limit(1);

  if (existing) {
    const [updated] = await db
      .update(guardianProfilesTable)
      .set(parsed.data)
      .returning();
    res.json(UpsertGuardianProfileResponse.parse(updated));
  } else {
    const [created] = await db
      .insert(guardianProfilesTable)
      .values(parsed.data)
      .returning();
    res.json(UpsertGuardianProfileResponse.parse(created));
  }
});

export default router;
