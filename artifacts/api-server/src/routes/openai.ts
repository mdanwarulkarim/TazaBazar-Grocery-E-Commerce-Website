import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

router.get("/openai/conversations", async (req, res) => {
  const convos = await db.select().from(conversations).orderBy(conversations.createdAt);
  res.json(convos);
});

router.post("/openai/conversations", async (req, res) => {
  const { title, phone } = req.body as { title: string; phone?: string };
  const [conv] = await db.insert(conversations).values({ title, phone: phone ?? null }).returning();
  res.status(201).json(conv);
});

router.get("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json({ ...conv, messages: msgs });
});

router.delete("/openai/conversations/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  await db.delete(conversations).where(eq(conversations.id, id));
  res.status(204).send();
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
  res.json(msgs);
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  const id = parseInt(req.params.id);
  const { content } = req.body as { content: string };

  const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  await db.insert(messages).values({ conversationId: id, role: "user", content });

  const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);

  const chatMessages = history.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  const systemPrompt = {
    role: "system" as const,
    content: `You are TazaBot, a helpful customer support assistant for TazaBazar — an online grocery delivery store in Bangladesh. 
You help customers with:
- Finding products (we have Food & Beverages, Dairy & Eggs, Snacks & Confectionery, Cleaning Supplies, Personal Care, Baby Care, Medicine & Health, Flash Sales)
- Delivery information (we deliver within 1 hour, free delivery)
- Order tracking and status
- Product recommendations
- General questions about TazaBazar

Keep responses concise and friendly. Use Bengali words occasionally to feel local (like "ভালো" meaning good, "ধন্যবাদ" for thanks). Currency is Taka (৳).`,
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 512,
      messages: [systemPrompt, ...chatMessages],
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err, "Chat stream error");
    res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
    res.end();
  }
});

export default router;
