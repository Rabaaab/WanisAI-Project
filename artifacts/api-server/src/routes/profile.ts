import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpsertProfileBody,
  UpsertProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const [profile] = await db.select().from(userProfilesTable).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json(GetProfileResponse.parse(profile));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(userProfilesTable).limit(1);

  if (existing) {
    const [updated] = await db
      .update(userProfilesTable)
      .set(parsed.data)
      .returning();
    res.json(UpsertProfileResponse.parse(updated));
  } else {
    const [created] = await db
      .insert(userProfilesTable)
      .values(parsed.data)
      .returning();
    res.json(UpsertProfileResponse.parse(created));
  }
});

export default router;
