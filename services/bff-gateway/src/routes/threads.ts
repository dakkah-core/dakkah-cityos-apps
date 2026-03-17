import { Router } from "express";
import { requireAuth, optionalAuth, getUserIdFromReq } from "../middleware/auth";

const router = Router();

interface StoredMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  artifacts?: unknown[];
  mode?: string;
  reactions?: unknown[];
  pinned?: boolean;
  replyToId?: string;
  replyToContent?: string;
  editedAt?: number;
  mentions?: string[];
  attachments?: unknown[];
}

interface StoredThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
  userId: string;
  messages: StoredMessage[];
}

const threadStore = new Map<string, StoredThread>();
const userThreadIndex = new Map<string, Set<string>>();

router.get("/threads", optionalAuth, (req, res) => {
  const userId = getUserIdFromReq(req);
  const userIds = userThreadIndex.get(userId);
  if (!userIds || userIds.size === 0) {
    res.json({ success: true, data: { threads: [] } });
    return;
  }

  const threads = Array.from(userIds)
    .map((id) => threadStore.get(id))
    .filter(Boolean)
    .map((t) => ({
      id: t!.id,
      title: t!.title,
      lastMessage: t!.lastMessage,
      timestamp: t!.timestamp,
      messageCount: t!.messages.length,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);

  res.json({ success: true, data: { threads } });
});

router.get("/threads/:threadId", optionalAuth, (req, res) => {
  const userId = getUserIdFromReq(req);
  const thread = threadStore.get(String(req.params.threadId));
  if (!thread) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Thread not found" } });
    return;
  }

  if (thread.userId !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  res.json({
    success: true,
    data: {
      id: thread.id,
      title: thread.title,
      messages: thread.messages,
      timestamp: thread.timestamp,
    },
  });
});

router.post("/threads", requireAuth, (req, res) => {
  const userId = getUserIdFromReq(req);
  const { threadId, title, messages } = req.body;

  if (!threadId || !messages || !Array.isArray(messages)) {
    res.status(400).json({ success: false, error: { code: "INVALID_REQUEST", message: "threadId and messages array required" } });
    return;
  }

  const lastMsg = messages[messages.length - 1];
  const userMsg = messages.find((m: StoredMessage) => m.role === "user");
  const threadTitle = title || userMsg?.content?.slice(0, 40) || "New Conversation";

  const thread: StoredThread = {
    id: threadId,
    title: threadTitle,
    lastMessage: lastMsg?.content?.slice(0, 60) || "",
    timestamp: lastMsg?.timestamp || Date.now(),
    userId,
    messages,
  };

  threadStore.set(threadId, thread);

  if (!userThreadIndex.has(userId)) {
    userThreadIndex.set(userId, new Set());
  }
  userThreadIndex.get(userId)!.add(threadId);

  res.json({ success: true, data: { threadId, synced: true } });
});

router.delete("/threads/:threadId", requireAuth, (req, res) => {
  const userId = getUserIdFromReq(req);
  const threadId = String(req.params.threadId);
  const thread = threadStore.get(threadId);

  if (!thread) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Thread not found" } });
    return;
  }

  if (thread.userId !== userId) {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  threadStore.delete(threadId);
  userThreadIndex.get(userId)?.delete(threadId);

  res.json({ success: true, data: { deleted: true } });
});

export default router;
