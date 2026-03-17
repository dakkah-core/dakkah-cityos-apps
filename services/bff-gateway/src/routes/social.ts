import { Router } from "express";
import { optionalAuth, getUserIdFromReq } from "../middleware/auth";

const router = Router();

const BFF_SOCIAL_PORT = process.env.BFF_SOCIAL_PORT || 4008;
const BFF_HOST = process.env.BFF_HOST || "localhost";

async function proxyToBff(path: string, method: string, body?: unknown) {
  try {
    const url = `http://${BFF_HOST}:${BFF_SOCIAL_PORT}/api${path}`;
    const options: RequestInit = { method, headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(5000) };
    if (body && method !== "GET") options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    if (res.ok) return { ok: true, data: await res.json() };
    return { ok: false, data: null };
  } catch {
    return { ok: false, data: null };
  }
}

const FALLBACK_FEED = [
  { id: "post_1", author: { id: "u_1", name: "Riyadh Municipality", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100", verified: true }, content: "🌳 New urban park opening this weekend in Al-Malaz district! 50,000 sqm of green space with playgrounds, sports courts, and cafés.", media: [{ type: "image", url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600" }], likes: 1245, comments: 89, shares: 234, createdAt: new Date(Date.now() - 3600000).toISOString(), tags: ["parks", "community"] },
  { id: "post_2", author: { id: "u_2", name: "Ahmad Al-Rashid", avatar: null, verified: false }, content: "Just used the new smart parking system downtown — found a spot in under 2 minutes! The city tech is getting impressive. 🚗", media: [], likes: 67, comments: 12, shares: 5, createdAt: new Date(Date.now() - 7200000).toISOString(), tags: ["tech", "parking"] },
  { id: "post_3", author: { id: "u_3", name: "CityOS Updates", avatar: null, verified: true }, content: "📊 Weekly city stats: Air quality improved 8%, traffic congestion down 12%, 342 citizen reports resolved. Keep the feedback coming!", media: [], likes: 890, comments: 156, shares: 423, createdAt: new Date(Date.now() - 14400000).toISOString(), tags: ["stats", "transparency"] },
  { id: "post_4", author: { id: "u_4", name: "Sara Mohammed", avatar: null, verified: false }, content: "The Arabic Calligraphy Workshop at the National Museum was amazing! Highly recommend — next session is March 25th. 🎨", media: [{ type: "image", url: "https://images.unsplash.com/photo-1579187707643-35646d22b596?w=600" }], likes: 234, comments: 45, shares: 67, createdAt: new Date(Date.now() - 28800000).toISOString(), tags: ["culture", "events"] },
];

const postStore: typeof FALLBACK_FEED = [...FALLBACK_FEED];

router.get("/feed", optionalAuth, async (req, res) => {
  const { limit, offset } = req.query;
  const bff = await proxyToBff(`/feed?limit=${limit || 20}&offset=${offset || 0}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  const lim = Math.min(Number(limit) || 20, 50);
  const off = Number(offset) || 0;
  const posts = postStore.slice(off, off + lim);
  res.json({ success: true, data: { posts, total: postStore.length, hasMore: off + lim < postStore.length, source: "fallback" } });
});

router.get("/posts/:id", optionalAuth, async (req, res) => {
  const bff = await proxyToBff(`/posts/${req.params.id}`, "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }
  const post = postStore.find(p => p.id === req.params.id);
  if (post) res.json({ success: true, data: { post, source: "fallback" } });
  else res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } });
});

router.post("/posts", optionalAuth, (req, res) => {
  const uid = getUserIdFromReq(req);
  const { content, tags } = req.body;
  if (!content || String(content).trim().length === 0) { res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Content is required" } }); return; }

  const post = {
    id: "post_" + Date.now(),
    author: { id: uid, name: "You", avatar: null, verified: false },
    content: String(content),
    media: [] as Array<{ type: string; url: string }>,
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date().toISOString(),
    tags: tags || [],
  };
  postStore.unshift(post);
  res.json({ success: true, data: { post, source: "fallback" } });
});

router.post("/posts/:id/like", optionalAuth, (req, res) => {
  const post = postStore.find(p => p.id === req.params.id);
  if (!post) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }); return; }
  post.likes++;
  res.json({ success: true, data: { postId: post.id, likes: post.likes } });
});

router.post("/posts/:id/comment", optionalAuth, (req, res) => {
  const { text } = req.body;
  const post = postStore.find(p => p.id === req.params.id);
  if (!post) { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Post not found" } }); return; }
  if (!text) { res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Comment text is required" } }); return; }
  post.comments++;
  res.json({ success: true, data: { postId: post.id, comments: post.comments, comment: { id: "cmt_" + Date.now(), text, createdAt: new Date().toISOString() } } });
});

router.get("/trending", optionalAuth, async (req, res) => {
  const bff = await proxyToBff("/trending", "GET");
  if (bff.ok) { res.json({ success: true, data: bff.data }); return; }

  res.json({
    success: true,
    data: {
      topics: [
        { tag: "RiyadhSeason", posts: 12400, trend: "+18%" },
        { tag: "SmartCity", posts: 8900, trend: "+12%" },
        { tag: "TechSummit2026", posts: 5600, trend: "+45%" },
        { tag: "GreenRiyadh", posts: 3200, trend: "+8%" },
        { tag: "CityOSUpdate", posts: 2100, trend: "+22%" },
      ],
      source: "fallback",
    },
  });
});

export default router;
