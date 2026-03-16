import type { Artifact, Message } from "../types/chat";

import placesData from "../data/scenarios/places.json";
import servicesData from "../data/scenarios/services.json";
import commerceData from "../data/scenarios/commerce.json";
import transitData from "../data/scenarios/transit.json";
import socialData from "../data/scenarios/social.json";
import healthData from "../data/scenarios/health.json";
import workData from "../data/scenarios/work.json";
import outdoorData from "../data/scenarios/outdoor.json";
import familyData from "../data/scenarios/family.json";
import petsData from "../data/scenarios/pets.json";
import cultureData from "../data/scenarios/culture.json";
import utilityData from "../data/scenarios/utility.json";
import intelData from "../data/scenarios/intel.json";
import eventsData from "../data/scenarios/events.json";
import planningData from "../data/scenarios/planning.json";
import miscData from "../data/scenarios/misc.json";
import homeData from "../data/scenarios/home.json";
import educationData from "../data/scenarios/education.json";
import beautyData from "../data/scenarios/beauty.json";
import wellnessData from "../data/scenarios/wellness.json";
import myActivityData from "../data/scenarios/my_activity.json";

interface ScenarioEntry {
  id: string;
  keywords: string[];
  response: string;
  artifact: { type: string; data: any };
  chips: string[];
}

interface CopilotResponse {
  content: string;
  artifacts?: Artifact[];
  mode?: "suggest" | "propose" | "execute";
}

const allScenarios: ScenarioEntry[] = [
  ...placesData,
  ...servicesData,
  ...commerceData,
  ...transitData,
  ...socialData,
  ...healthData,
  ...workData,
  ...outdoorData,
  ...familyData,
  ...petsData,
  ...cultureData,
  ...utilityData,
  ...intelData,
  ...eventsData,
  ...planningData,
  ...miscData,
  ...homeData,
  ...educationData,
  ...beautyData,
  ...wellnessData,
  ...myActivityData,
] as ScenarioEntry[];

function findBestScenario(input: string): ScenarioEntry | null {
  const lower = input.toLowerCase();
  let bestMatch: ScenarioEntry | null = null;
  let bestScore = 0;

  for (const scenario of allScenarios) {
    let matchedLength = 0;
    let matchCount = 0;

    for (const keyword of scenario.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        matchedLength += keyword.length;
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const score = matchedLength + matchCount * 0.1;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = scenario;
      }
    }
  }

  return bestMatch;
}

function handleHardcodedPatterns(lower: string): CopilotResponse | null {
  if (lower.includes("quiet") || lower.includes("places near")) {
    return {
      content: "Here are some quiet spots near you that match your vibe. Each one has been rated by local ambassadors.",
      mode: "execute",
      artifacts: [
        {
          type: "poi-carousel",
          data: {
            pois: [
              { id: "p1", name: "The Quiet Garden", category: "Cafe", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400", rating: 4.8, distance: "0.3 km", vibe: ["#quiet", "#cozy"], priceRange: "$$", openNow: true },
              { id: "p2", name: "Book & Brew", category: "Coffee House", image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400", rating: 4.6, distance: "0.8 km", vibe: ["#reading", "#artisanal"], priceRange: "$", openNow: true },
              { id: "p3", name: "Zen Corner", category: "Tea Lounge", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400", rating: 4.9, distance: "1.2 km", vibe: ["#zen", "#minimal"], priceRange: "$$", openNow: true },
              { id: "p4", name: "Olive & Stone", category: "Bistro", image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=400", rating: 4.7, distance: "1.5 km", vibe: ["#garden", "#organic"], priceRange: "$$$", openNow: false },
            ],
          },
        },
        { type: "selection-chips", data: { question: "Want to refine?", options: ["Open now only", "Under $20", "Walking distance", "Show on map"] } },
      ],
    };
  }

  if (lower.includes("plan") && (lower.includes("trip") || lower.includes("day") || lower.includes("riyadh") || lower.includes("experience") || lower.includes("weekend"))) {
    return {
      content: "I've created a personalized 3-day Riyadh experience based on your preferences. Each day balances culture, food, and relaxation.",
      mode: "execute",
      artifacts: [
        {
          type: "itinerary-timeline",
          data: {
            days: [
              { day: 1, title: "Cultural Immersion", items: [
                { time: "09:00", title: "Al Masmak Fortress", type: "culture", duration: "2h", cost: "Free" },
                { time: "11:30", title: "Souq Al Zal", type: "shopping", duration: "1.5h", cost: "$" },
                { time: "13:00", title: "Lunch at Najd Village", type: "food", duration: "1h", cost: "$$" },
                { time: "15:00", title: "National Museum", type: "culture", duration: "3h", cost: "$" },
                { time: "19:00", title: "Dinner at The Globe", type: "food", duration: "2h", cost: "$$$" },
              ]},
              { day: 2, title: "Modern Riyadh", items: [
                { time: "10:00", title: "Kingdom Centre Tower", type: "landmark", duration: "1.5h", cost: "$$" },
                { time: "12:00", title: "Brunch at LPM", type: "food", duration: "1.5h", cost: "$$$" },
                { time: "14:00", title: "JAX District", type: "arts", duration: "2h", cost: "Free" },
                { time: "17:00", title: "Edge of the World", type: "nature", duration: "3h", cost: "$" },
              ]},
              { day: 3, title: "Local Favorites", items: [
                { time: "09:00", title: "Wadi Hanifah", type: "nature", duration: "2h", cost: "Free" },
                { time: "11:30", title: "Coffee at Elixir Bunn", type: "food", duration: "1h", cost: "$" },
                { time: "13:00", title: "Diriyah Season", type: "culture", duration: "3h", cost: "$$" },
                { time: "17:00", title: "Sunset at Boulevard", type: "leisure", duration: "2h", cost: "Free" },
              ]},
            ],
          },
        },
        { type: "selection-chips", data: { question: "Adjust the plan?", options: ["Make it cheaper", "Less walking", "More food spots", "Add nightlife"] } },
      ],
    };
  }

  if (lower.includes("ambassador") || lower.includes("trust") || lower.includes("who should")) {
    return {
      content: "Here are top-rated local ambassadors whose expertise matches what you're looking for. Each has been verified through our trust layer.",
      mode: "execute",
      artifacts: [
        {
          type: "ambassador-carousel",
          data: {
            ambassadors: [
              { id: "a1", name: "Sarah Al-Rashid", specialty: "Culinary Expert", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", fitScore: 96, reviews: 234, verified: true },
              { id: "a2", name: "Omar Khalil", specialty: "Heritage Guide", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", fitScore: 92, reviews: 189, verified: true },
              { id: "a3", name: "Lina Mansour", specialty: "Nightlife Curator", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200", fitScore: 88, reviews: 156, verified: true },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("zone") || lower.includes("trending") || lower.includes("neighborhood")) {
    return {
      content: "Here's the real-time Zone Experience Score for areas around you. Higher scores mean more activity, better vibes, and more happening events.",
      mode: "execute",
      artifacts: [
        {
          type: "zone-heatmap",
          data: {
            zones: [
              { id: "z1", name: "Downtown", score: 92, trend: "up", factors: { vibes: 95, activity: 90, safety: 88, events: 94 } },
              { id: "z2", name: "Arts District", score: 87, trend: "up", factors: { vibes: 92, activity: 82, safety: 90, events: 85 } },
              { id: "z3", name: "Waterfront", score: 78, trend: "stable", factors: { vibes: 80, activity: 75, safety: 92, events: 65 } },
              { id: "z4", name: "Old Quarter", score: 85, trend: "down", factors: { vibes: 88, activity: 80, safety: 85, events: 87 } },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("book") || lower.includes("reserve") || lower.includes("confirm")) {
    return {
      content: "I've prepared this booking for you. Please review the details and confirm when ready.",
      mode: "propose",
      artifacts: [
        {
          type: "confirmation-card",
          data: {
            title: "Restaurant Reservation",
            venue: "The Golden Plate",
            date: "Tonight",
            time: "8:00 PM",
            guests: 2,
            total: "$85",
            notes: "Window table requested",
            actions: ["Confirm Booking", "Modify", "Cancel"],
          },
        },
      ],
    };
  }

  if (lower.includes("compare") || lower.includes("versus") || lower.includes("vs")) {
    return {
      content: "Here's a side-by-side comparison to help you decide.",
      mode: "execute",
      artifacts: [
        {
          type: "comparison-table",
          data: {
            criteria: ["Rating", "Price", "Distance", "Ambiance", "Wait Time"],
            items: [
              { name: "The Golden Plate", values: { Rating: 4.8, Price: "$$$", Distance: "0.5 km", Ambiance: "Fine Dining", "Wait Time": "15 min" } },
              { name: "Olive Garden", values: { Rating: 4.5, Price: "$$", Distance: "1.2 km", Ambiance: "Casual", "Wait Time": "5 min" } },
              { name: "Sakura House", values: { Rating: 4.9, Price: "$$$", Distance: "2.0 km", Ambiance: "Intimate", "Wait Time": "30 min" } },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("xp") || lower.includes("badge") || lower.includes("level") || lower.includes("earn") || lower.includes("progress") || lower.includes("gamif")) {
    return {
      content: "Here's your current progress in the Dakkah ecosystem. Keep exploring to level up!",
      mode: "execute",
      artifacts: [
        {
          type: "progress-card",
          data: {
            level: 12,
            xp: 2450,
            xpToNext: 3000,
            title: "City Explorer",
            badges: [
              { name: "First Discovery", icon: "compass", earned: true },
              { name: "Foodie", icon: "utensils", earned: true },
              { name: "Night Owl", icon: "moon", earned: true },
              { name: "Culture Seeker", icon: "landmark", earned: false },
              { name: "Social Butterfly", icon: "users", earned: false },
            ],
            missions: [
              { title: "Visit 3 new cafes", progress: 67, reward: "150 XP" },
              { title: "Attend a cultural event", progress: 0, reward: "200 XP" },
              { title: "Write 5 reviews", progress: 40, reward: "100 XP" },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("ticket") || lower.includes("pass") || lower.includes("boarding")) {
    return {
      content: "Here's your ticket. Show the QR code at the entrance.",
      mode: "execute",
      artifacts: [
        {
          type: "ticket-pass",
          data: {
            id: "t1",
            eventName: "Jazz Under Stars",
            date: "Tonight",
            time: "8:00 PM",
            seat: "GA-42",
            location: "Rooftop Garden, Downtown",
          },
        },
      ],
    };
  }

  if (lower.includes("help") || lower.includes("what can you") || lower.includes("how do you work") || lower.includes("your features")) {
    return {
      content: "I'm your Dakkah Copilot — your AI concierge for the entire city. Here's what I can help with:\n\n• **Discover** places, restaurants, cafes, and hidden gems\n• **Plan** trips, itineraries, and date nights\n• **Events** — find what's happening and get tickets\n• **Book** restaurants, services, and experiences\n• **Compare** options side-by-side\n• **Track** orders and deliveries\n• **Zone Intelligence** — see what's trending in each area\n• **Progress** — earn XP, badges, and complete missions\n\nJust tell me what you need in natural language!",
      mode: "suggest",
      artifacts: [
        { type: "selection-chips", data: { question: "Try one of these:", options: ["Show me quiet places", "Plan a weekend trip", "What's happening tonight?", "How do I earn XP?"] } },
      ],
    };
  }

  return null;
}

export function processUserMessage(input: string): CopilotResponse {
  const lower = input.toLowerCase();

  const scenario = findBestScenario(input);
  if (scenario) {
    const artifacts: Artifact[] = [
      { type: scenario.artifact.type as Artifact["type"], data: scenario.artifact.data },
    ];

    if (scenario.chips && scenario.chips.length > 0) {
      artifacts.push({
        type: "selection-chips",
        data: { question: "What next?", options: scenario.chips },
      });
    }

    return {
      content: scenario.response,
      mode: "execute",
      artifacts,
    };
  }

  const hardcoded = handleHardcodedPatterns(lower);
  if (hardcoded) return hardcoded;

  return {
    content: "I understand you're looking for something. Let me help you explore. You can ask me about places, events, trip planning, bookings, zone intelligence, or anything else about the city. What interests you most?",
    mode: "suggest",
    artifacts: [
      { type: "selection-chips", data: { question: "Popular requests:", options: ["Quiet places nearby", "Plan a 3-day trip", "Trending zones", "What's happening tonight?"] } },
    ],
  };
}
