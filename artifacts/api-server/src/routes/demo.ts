import { Router } from "express";
import { db, conversationsTable, messagesTable, medicationsTable, doctorBriefsTable } from "@workspace/db";

const router = Router();

// POST /api/demo/seed - inserts demo data for presentations
router.post('/demo/seed', async (_req, res) => {
  try {
    // create a conversation
    const [conv] = await db.insert(conversationsTable).values({ title: 'Demo Conversation' }).returning();
    // user message
    await db.insert(messagesTable).values({ conversationId: conv.id, role: 'user', content: 'Hello Wanis, demo test' });
    // assistant fallback message
    await db.insert(messagesTable).values({ conversationId: conv.id, role: 'assistant', content: `Hi Friend, this is a demo reply. The AI assistant is temporarily limited; your message has been saved.` });

    // insert a medication and a pre-seeded intelligence
    const [med] = await db.insert(medicationsTable).values({ name: 'Amitriptyline', dosage: '10 mg', frequency: 'Once daily', acbScore: 3 }).returning();

    await db.insert(doctorBriefsTable).values({ patientName: 'Demo Patient', medicationFindings: 'Demo: Amitriptyline may contribute to anticholinergic burden.', checkInSummary: 'Demo check-ins indicate stable mood.', acbScore: 3, key: 'demo-key' });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

export default router;
