import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, familyMembersTable } from "@workspace/db";
import {
  ListFamilyMembersResponse,
  CreateFamilyMemberBody,
  CreateFamilyMemberResponse,
  GetFamilyMemberParams,
  GetFamilyMemberResponse,
  UpdateFamilyMemberParams,
  UpdateFamilyMemberBody,
  UpdateFamilyMemberResponse,
  DeleteFamilyMemberParams,
  GetFamilyMembersSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/family-members/summary", async (_req, res): Promise<void> => {
  const members = await db.select().from(familyMembersTable);
  const summary = {
    totalMembers: members.length,
    emergencyContacts: members.filter((m) => m.isEmergencyContact).length,
    hasPhotos: members.filter((m) => m.photoUrl).length,
  };
  res.json(GetFamilyMembersSummaryResponse.parse(summary));
});

router.get("/family-members", async (_req, res): Promise<void> => {
  const members = await db
    .select()
    .from(familyMembersTable)
    .orderBy(familyMembersTable.createdAt);
  res.json(ListFamilyMembersResponse.parse(members));
});

router.post("/family-members", async (req, res): Promise<void> => {
  const parsed = CreateFamilyMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [member] = await db
    .insert(familyMembersTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateFamilyMemberResponse.parse(member));
});

router.get("/family-members/:id", async (req, res): Promise<void> => {
  const params = GetFamilyMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [member] = await db
    .select()
    .from(familyMembersTable)
    .where(eq(familyMembersTable.id, params.data.id));
  if (!member) {
    res.status(404).json({ error: "Family member not found" });
    return;
  }
  res.json(GetFamilyMemberResponse.parse(member));
});

router.patch("/family-members/:id", async (req, res): Promise<void> => {
  const params = UpdateFamilyMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateFamilyMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [member] = await db
    .update(familyMembersTable)
    .set(parsed.data)
    .where(eq(familyMembersTable.id, params.data.id))
    .returning();
  if (!member) {
    res.status(404).json({ error: "Family member not found" });
    return;
  }
  res.json(UpdateFamilyMemberResponse.parse(member));
});

router.delete("/family-members/:id", async (req, res): Promise<void> => {
  const params = DeleteFamilyMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(familyMembersTable)
    .where(eq(familyMembersTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Family member not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
