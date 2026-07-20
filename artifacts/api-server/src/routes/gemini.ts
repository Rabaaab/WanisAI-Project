import { Router, type IRouter } from "express";
import { eq, asc, desc, and } from "drizzle-orm";
import { db, conversationsTable, messagesTable, checkInsTable, memoryPhotosTable, userProfilesTable, lifeStoryEntriesTable } from "@workspace/db";
import { gemini } from "../lib/gemini";
import {
  ListGeminiConversationsResponse,
  CreateGeminiConversationBody,
  CreateGeminiConversationResponse,
  GetGeminiConversationParams,
  GetGeminiConversationResponse,
  DeleteGeminiConversationParams,
  ListGeminiMessagesParams,
  ListGeminiMessagesResponse,
  SendGeminiMessageParams,
  SendGeminiMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
type MemoryPhoto = typeof memoryPhotosTable.$inferSelect;
type CheckIn = typeof checkInsTable.$inferSelect;
type Message = typeof messagesTable.$inferSelect;

router.get("/gemini/conversations", async (_req, res): Promise<void> => {
  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(asc(conversationsTable.createdAt));
  res.json(ListGeminiConversationsResponse.parse(conversations));
});

router.post("/gemini/conversations", async (req, res): Promise<void> => {
  const parsed = CreateGeminiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [conversation] = await db
    .insert(conversationsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateGeminiConversationResponse.parse(conversation));
});

router.get("/gemini/conversations/:id", async (req, res): Promise<void> => {
  const params = GetGeminiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(
    GetGeminiConversationResponse.parse({ ...conversation, messages: msgs })
  );
});

router.delete("/gemini/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteGeminiConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.sendStatus(204);
});

router.get(
  "/gemini/conversations/:id/messages",
  async (req, res): Promise<void> => {
    const params = ListGeminiMessagesParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, params.data.id))
      .orderBy(asc(messagesTable.createdAt));
    res.json(ListGeminiMessagesResponse.parse(msgs));
  }
);

router.post(
  "/gemini/conversations/:id/messages",
  async (req, res): Promise<void> => {
    const { isGeminiConfigured } = await import("../lib/gemini");
    const params = SendGeminiMessageParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = SendGeminiMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, params.data.id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Save the user message
    await db.insert(messagesTable).values({
      conversationId: params.data.id,
      role: "user",
      content: parsed.data.content,
    });

    // Fetch memory context: profile, photos, check-ins, conversations
    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .limit(1);

    const memoryPhotos = await db
      .select()
      .from(memoryPhotosTable);

    const lastCheckIns = await db
      .select()
      .from(checkInsTable)
      .orderBy(desc(checkInsTable.createdAt))
      .limit(5);

    const lastConvos = await db
      .select()
      .from(conversationsTable)
      .orderBy(desc(conversationsTable.createdAt))
      .limit(3);

    const convoSummaries: string[] = [];
    for (const convo of lastConvos) {
      const [lastMsg] = await db
        .select()
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.conversationId, convo.id),
            eq(messagesTable.role, "assistant")
          )
        )
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);
      if (lastMsg) {
        convoSummaries.push(`${convo.title}: "${lastMsg.content.slice(0, 100)}..."`);
      } else {
        convoSummaries.push(convo.title);
      }
    }

    const name = profile?.name ?? "Friend";
    const lovedPeople = memoryPhotos.map((p: MemoryPhoto) => `${p.personName} (${p.relationship})`).join(", ") || "None mentioned yet";
    const recentMoods = lastCheckIns.map((c: CheckIn) => c.mood).filter(Boolean).slice(0, 3).join(", ") || "Stable";
    const lastWeekSnippet = lastCheckIns[0]?.response ? lastCheckIns[0].response.slice(0, 200) : "Nothing shared yet";
    const suggestedAction = lastCheckIns[0]?.actionSuggested ?? "None";
    const pastConvoTopics = convoSummaries.join(", ") || "None yet";

    const memoryBlock = `WHAT I KNOW ABOUT THIS PERSON:
Name: ${name}
People they love: ${lovedPeople}
Recent mood signals: ${recentMoods}
Last week they shared: "${lastWeekSnippet}"
Their suggested action was: "${suggestedAction}"
Past conversation topics: ${pastConvoTopics}`;

    const languageMap: Record<string, string> = {
      en: "English",
      ar: "Arabic",
      fr: "French"
    };
    const language = languageMap[parsed.data.lang ?? "en"] || "English";

    const systemPrompt = `${memoryBlock}\n\n` +
      `You are Wanis — a warm, deeply caring daily companion who remembers this person. You know their name, the people they love, and what they have shared with you before. Reference these naturally and gently — not all at once, but the way a caring friend would. You speak in ${language}. Respond in the same language the user writes in. Never diagnose. Never evaluate. Respond in short warm sentences.`;

    // Load full conversation history
    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, params.data.id))
      .orderBy(asc(messagesTable.createdAt));

    const chatMessages = history.map((m: Message) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const fallbackResponse = `Hi ${conversation.title || "Friend"}, I'm still here with you. Please keep sharing — I'll remember it.`;

    const sendFallback = async (fallback = fallbackResponse) => {
      try {
        await db.insert(messagesTable).values({
          conversationId: params.data.id,
          role: "assistant",
          content: fallback,
        });
      } catch (dbErr) {
        req.log?.error?.({ dbErr }, "Failed to save fallback assistant message");
      }
      res.write(`data: ${JSON.stringify({ content: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    };

    let fullResponse = "";

    if (!isGeminiConfigured()) {
      await sendFallback();
      return;
    }

    try {
      const stream = await gemini.models.generateContentStream({
        model: "gemini-flash-latest",
        contents: chatMessages,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 8192,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          res.write(
            `data: ${JSON.stringify({ content: chunk.text })}\n\n`
          );
        }
      }

      if (!fullResponse.trim()) {
        await sendFallback();
        return;
      }

      await db.insert(messagesTable).values({
        conversationId: params.data.id,
        role: "assistant",
        content: fullResponse,
      });

      try {
        const capturePrompt = `Analyze this message from Wanis (an AI companion) to a senior user: "${fullResponse}". Does it reference a memory, a named person, or a specific emotion? If yes, write a brief, one-sentence summary of what they discussed from the user's perspective in the language of the conversation (e.g. 'Shared a childhood memory of their hometown' or 'تحدث عن ابنته سارة'). If no, write exactly 'NO'. Respond only with the summary or 'NO'.`;

        const captureRes = await gemini.models.generateContent({
          model: "gemini-flash-latest",
          contents: capturePrompt,
          config: {
            maxOutputTokens: 150,
          },
        });

        const summary = captureRes.text?.trim() ?? "";
        if (summary && summary !== "NO" && !summary.startsWith("NO")) {
          await db.insert(lifeStoryEntriesTable).values({
            source: "conversation",
            content: summary,
          });
        }
      } catch (captureErr) {
        req.log?.error?.({ captureErr }, "Error auto-capturing conversation life story entry");
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      req.log?.error?.({ err }, "Error streaming gemini message");
      await sendFallback();
      return;
    }
  }
);

export default router;
