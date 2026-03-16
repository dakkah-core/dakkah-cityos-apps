import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

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
- Use natural conversational tone, not robotic`;

router.post("/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const chatMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: model || "gpt-5-mini",
      messages: chatMessages,
      max_completion_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "I'm not sure how to help with that. Could you rephrase?";

    res.json({
      success: true,
      data: {
        content,
        model: completion.model,
        usage: completion.usage,
      },
    });
  } catch (err: any) {
    console.error("AI chat error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "AI_ERROR", message: err.message },
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
  } catch (err: any) {
    console.error("Transcription error:", err.message);
    res.status(500).json({
      success: false,
      error: { code: "TRANSCRIBE_ERROR", message: err.message },
    });
  }
});

export default router;
