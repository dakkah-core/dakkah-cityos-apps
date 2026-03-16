import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const BFF_PORTS: Record<string, number> = {
  commerce: 4001,
  transport: 4002,
  healthcare: 4003,
  governance: 4004,
  events: 4005,
  platform: 4006,
  iot: 4007,
  social: 4008,
};

const INTENT_MAP: Record<string, { service: string; action: string; description: string }> = {
  "product.search": { service: "commerce", action: "searchProducts", description: "Search for products" },
  "product.details": { service: "commerce", action: "getProduct", description: "Get product details" },
  "cart.add": { service: "commerce", action: "addToCart", description: "Add item to cart" },
  "cart.view": { service: "commerce", action: "getCart", description: "View shopping cart" },
  "order.create": { service: "commerce", action: "createOrder", description: "Place an order" },
  "order.track": { service: "commerce", action: "trackOrder", description: "Track an order" },
  "ride.request": { service: "transport", action: "requestRide", description: "Request a ride" },
  "ride.status": { service: "transport", action: "getRideStatus", description: "Check ride status" },
  "health.symptoms": { service: "healthcare", action: "triageSymptoms", description: "Symptom assessment" },
  "health.appointment": { service: "healthcare", action: "bookAppointment", description: "Book appointment" },
  "permit.apply": { service: "governance", action: "applyPermit", description: "Apply for permit" },
  "permit.status": { service: "governance", action: "getPermitStatus", description: "Check permit status" },
  "event.search": { service: "events", action: "searchEvents", description: "Find events" },
  "event.book": { service: "events", action: "bookTicket", description: "Book event tickets" },
  "iot.parking": { service: "iot", action: "findParking", description: "Find parking" },
  "iot.smart-home": { service: "iot", action: "controlDevice", description: "Smart home control" },
  "social.feed": { service: "social", action: "getFeed", description: "Community feed" },
  "social.ambassador": { service: "social", action: "findAmbassadors", description: "Find ambassadors" },
};

const SYSTEM_PROMPT = `You are Dakkah Copilot — an AI concierge for the entire city of Riyadh, Saudi Arabia. You are part of Dakkah CityOS, a Conversational City Experience OS.

Your capabilities:
- Discover places: restaurants, cafes, parks, museums, nightlife, wellness, shopping
- Plan trips: multi-day itineraries, day plans, weekend getaways
- Book services: restaurants, salons, spa, hotels, transportation
- City intelligence: weather, traffic, events, zone scores, safety alerts
- Commerce: products, vendors, orders, payments, invoices
- Health & wellness: symptom checking, appointments, health metrics
- Smart city: parking, permits, issue reporting, utilities
- Social: community feed, ambassadors, group activities
- Education: courses, lessons, skill tracking
- Finance: wallet, crypto, credit, escrow

Response style:
- Be warm, concise, and helpful
- Use Saudi/Gulf cultural awareness (SAR currency, local customs, Arabic names)
- When suggesting places, include ratings, vibes, and price ranges
- For bookings/actions, confirm before executing
- Keep responses under 200 words unless detailed info is requested
- Use natural conversational tone, not robotic

IMPORTANT: When your response involves structured data (products, events, status updates, etc), you MUST include an "intent" field in your JSON response to indicate the action domain. Use the format "domain.action" (e.g., "product.search", "ride.request", "event.search").

When you detect a user intent that maps to a backend action, include it as a JSON code block at the END of your response:
\`\`\`intent
{"intent": "product.search", "params": {"query": "coffee", "category": "food"}}
\`\`\``;

interface IntentBlock {
  intent: string;
  params: Record<string, unknown>;
}

function extractIntent(content: string): { cleanContent: string; intentBlock: IntentBlock | null } {
  const intentRegex = /```intent\s*\n?([\s\S]*?)\n?```/;
  const match = content.match(intentRegex);
  if (!match) return { cleanContent: content, intentBlock: null };

  try {
    const parsed = JSON.parse(match[1]);
    const cleanContent = content.replace(intentRegex, "").trim();
    return { cleanContent, intentBlock: parsed };
  } catch {
    return { cleanContent: content, intentBlock: null };
  }
}

async function callBff(service: string, action: string, params: Record<string, unknown>): Promise<unknown> {
  const port = BFF_PORTS[service];
  if (!port) return null;

  const bffHost = process.env.BFF_HOST || "localhost";
  try {
    const res = await fetch(`http://${bffHost}:${port}/api/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

router.post("/chat", async (req, res) => {
  try {
    const { messages, model, threadId, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const systemMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
    ];

    if (context) {
      systemMessages.push({
        role: "system" as const,
        content: `User context: location=${context.location || "Riyadh"}, language=${context.language || "en"}, tier=${context.tier || "Explorer"}`,
      });
    }

    const chatMessages = [
      ...systemMessages,
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: model || "gpt-5-mini",
      messages: chatMessages,
      max_completion_tokens: 2000,
    });

    const rawContent = completion.choices[0]?.message?.content || "I'm not sure how to help with that. Could you rephrase?";
    const { cleanContent, intentBlock } = extractIntent(rawContent);

    let bffData: unknown = null;
    let resolvedIntent: string | null = null;

    if (intentBlock && INTENT_MAP[intentBlock.intent]) {
      resolvedIntent = intentBlock.intent;
      const mapping = INTENT_MAP[intentBlock.intent];
      bffData = await callBff(mapping.service, mapping.action, intentBlock.params);
    }

    res.json({
      success: true,
      data: {
        content: cleanContent,
        model: completion.model,
        usage: completion.usage,
        intent: resolvedIntent,
        bffData,
        threadId: threadId || null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("AI chat error:", message);
    res.status(500).json({
      success: false,
      error: { code: "AI_ERROR", message },
    });
  }
});

router.post("/transcribe", async (req, res) => {
  try {
    const { audio, format } = req.body;
    if (!audio) {
      res.status(400).json({ error: "audio data required" });
      return;
    }

    const buffer = Buffer.from(audio, "base64");
    const file = new File([buffer], `recording.${format || "webm"}`, {
      type: `audio/${format || "webm"}`,
    });

    const transcription = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file,
      response_format: "json",
    });

    res.json({
      success: true,
      data: { text: transcription.text },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Transcription error:", message);
    res.status(500).json({
      success: false,
      error: { code: "TRANSCRIBE_ERROR", message },
    });
  }
});

export default router;
