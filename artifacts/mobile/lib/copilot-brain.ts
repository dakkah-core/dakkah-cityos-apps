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

  if (lower.includes("flash sale") || lower.includes("deal") || lower.includes("discount") || lower.includes("countdown")) {
    const futureDate = new Date(Date.now() + 3 * 3600000).toISOString();
    return {
      content: "There's a flash sale happening right now! Here are the details — act fast before it ends.",
      mode: "execute",
      artifacts: [
        {
          type: "flash-sale-countdown",
          data: {
            productName: "Premium Wireless Earbuds",
            originalPrice: "$149",
            salePrice: "$79",
            image: "",
            endsAt: futureDate,
            soldCount: 187,
            totalStock: 250,
          },
        },
      ],
    };
  }

  if (lower.includes("vendor") || lower.includes("seller") || lower.includes("trust score") || lower.includes("seller rating")) {
    return {
      content: "Here's the trust profile for this vendor. All metrics are verified through our platform.",
      mode: "execute",
      artifacts: [
        {
          type: "vendor-trust-profile",
          data: {
            name: "Al-Faisal Electronics",
            category: "Electronics & Gadgets",
            trustScore: 94,
            totalReviews: 1243,
            responseRate: 98,
            responseTime: "< 1 hour",
            badges: ["Top Seller", "Fast Shipper", "Verified Business"],
            memberSince: "2021",
            recentReview: { author: "Ahmed K.", text: "Excellent quality and fast shipping. Highly recommended!", rating: 5 },
          },
        },
      ],
    };
  }

  if (lower.includes("invoice") || lower.includes("bill") || lower.includes("payment due")) {
    return {
      content: "Here's your invoice summary. You can review the details and pay directly.",
      mode: "execute",
      artifacts: [
        {
          type: "invoice-preview",
          data: {
            invoiceNumber: "INV-2024-0847",
            vendor: "Cloud Services Co.",
            date: "Mar 1, 2026",
            dueDate: "Mar 31, 2026",
            status: "pending",
            lineItems: [
              { description: "Cloud Hosting (Pro Plan)", amount: "$49.99" },
              { description: "Additional Storage (50GB)", amount: "$9.99" },
              { description: "SSL Certificate", amount: "$12.00" },
            ],
            subtotal: "$71.98",
            tax: "$10.80",
            total: "$82.78",
          },
        },
      ],
    };
  }

  if (lower.includes("credit") || lower.includes("credit limit") || lower.includes("credit card") || lower.includes("balance")) {
    return {
      content: "Here's your current credit usage overview.",
      mode: "execute",
      artifacts: [
        {
          type: "credit-limit-gauge",
          data: {
            used: 3250,
            limit: 10000,
            currency: "$",
            accountName: "Platinum Rewards Card",
            lastPayment: "Feb 28, 2026",
            nextDue: "Mar 28, 2026",
            minPayment: "$65.00",
          },
        },
      ],
    };
  }

  if (lower.includes("escrow") || lower.includes("funds held") || lower.includes("milestone payment")) {
    return {
      content: "Here's the current status of your escrow transaction.",
      mode: "execute",
      artifacts: [
        {
          type: "escrow-status",
          data: {
            transactionId: "ESC-78421",
            buyer: "Sarah M.",
            seller: "HomeReno Pro",
            totalAmount: "$15,000",
            milestones: [
              { title: "Initial Deposit", amount: "$3,000", status: "completed", date: "Feb 15, 2026" },
              { title: "Materials & Prep", amount: "$5,000", status: "completed", date: "Mar 1, 2026" },
              { title: "Installation", amount: "$5,000", status: "active" },
              { title: "Final Inspection", amount: "$2,000", status: "pending" },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("symptom") || lower.includes("feeling sick") || lower.includes("headache") || lower.includes("fever") || lower.includes("health check") || lower.includes("not feeling well")) {
    return {
      content: "I've run a preliminary symptom assessment based on what you've described. Please remember this is informational only.",
      mode: "execute",
      artifacts: [
        {
          type: "symptom-triage",
          data: {
            symptoms: ["Headache", "Fatigue", "Mild Fever"],
            severity: "moderate",
            recommendation: "Your symptoms suggest a common viral infection. Rest, stay hydrated, and monitor for 24-48 hours. Seek medical attention if symptoms worsen.",
            possibleConditions: [
              { name: "Common Cold", likelihood: "High" },
              { name: "Seasonal Flu", likelihood: "Moderate" },
              { name: "Stress/Fatigue", likelihood: "Low" },
            ],
            nextSteps: [
              "Rest and drink plenty of fluids",
              "Take over-the-counter pain relief if needed",
              "Monitor temperature every 4 hours",
              "Consult a doctor if fever exceeds 39°C",
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("lesson") || lower.includes("course") || lower.includes("learning") || lower.includes("study") || lower.includes("module") || lower.includes("class")) {
    return {
      content: "Here's your current course progress. Keep up the great work!",
      mode: "execute",
      artifacts: [
        {
          type: "lesson-tracker",
          data: {
            courseName: "Introduction to Data Science",
            instructor: "Dr. Fatima Al-Hassan",
            progress: 62,
            completedModules: 5,
            totalModules: 8,
            modules: [
              { title: "Data Fundamentals", duration: "45 min", status: "completed" },
              { title: "Python for Analysis", duration: "1h 20min", status: "completed" },
              { title: "Statistics Basics", duration: "55 min", status: "completed" },
              { title: "Data Visualization", duration: "1h 10min", status: "completed" },
              { title: "Machine Learning Intro", duration: "1h 30min", status: "completed" },
              { title: "Regression Models", duration: "1h 15min", status: "in-progress" },
              { title: "Classification", duration: "1h 20min", status: "locked" },
              { title: "Final Project", duration: "2h", status: "locked" },
            ],
            nextDeadline: "Mar 22, 2026",
          },
        },
      ],
    };
  }

  if (lower.includes("permit") || lower.includes("license") || lower.includes("application") || lower.includes("government") || lower.includes("municipal")) {
    return {
      content: "Here's the current status of your permit application.",
      mode: "execute",
      artifacts: [
        {
          type: "permit-application",
          data: {
            permitType: "Building Renovation Permit",
            applicationId: "BRP-2026-04521",
            status: "under-review",
            submittedDate: "Feb 20, 2026",
            estimatedCompletion: "Apr 5, 2026",
            applicant: "Mohammed Al-Rashid",
            documents: [
              { name: "Property Deed", status: "approved" },
              { name: "Floor Plan", status: "submitted" },
              { name: "Contractor License", status: "approved" },
              { name: "Environmental Assessment", status: "missing" },
            ],
            notes: "Environmental assessment required before final approval. Please upload within 14 days.",
          },
        },
      ],
    };
  }

  if (lower.includes("pothole") || lower.includes("report issue") || lower.includes("broken") || lower.includes("streetlight") || lower.includes("civic") || lower.includes("city issue") || lower.includes("report a")) {
    return {
      content: "I've prepared a civic issue report for you. Review the details and submit when ready.",
      mode: "propose",
      artifacts: [
        {
          type: "issue-reporter",
          data: {
            issueType: "Road Damage - Pothole",
            category: "Infrastructure",
            description: "Large pothole on the main road near the intersection. Approximately 30cm wide and causing traffic disruption. Multiple vehicles observed swerving to avoid it.",
            location: "King Fahd Road, near Al Olaya District",
            status: "draft",
            priority: "high",
          },
        },
      ],
    };
  }

  if (lower.includes("flight") || lower.includes("boarding") || lower.includes("my flight") || lower.includes("gate") || lower.includes("airline")) {
    return {
      content: "Here's your boarding pass. Make sure to arrive at the gate on time!",
      mode: "execute",
      artifacts: [
        {
          type: "flight-boarding-pass",
          data: {
            passengerName: "MOHAMMED AL-RASHID",
            flightNumber: "SV 312",
            airline: "Saudia Airlines",
            from: { code: "RUH", city: "Riyadh" },
            to: { code: "JED", city: "Jeddah" },
            date: "Mar 18, 2026",
            boardingTime: "14:30",
            departureTime: "15:15",
            gate: "B7",
            seat: "12A",
            class: "Business",
            status: "on-time",
          },
        },
      ],
    };
  }

  if (lower.includes("convert") || lower.includes("exchange rate") || lower.includes("currency") || lower.includes("usd to") || lower.includes("to sar") || lower.includes("how much in")) {
    return {
      content: "Here's the current exchange rate and conversion for you.",
      mode: "execute",
      artifacts: [
        {
          type: "currency-converter",
          data: {
            from: { code: "USD", name: "US Dollar", flag: "🇺🇸", amount: 1000 },
            to: { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦", amount: 3750.50 },
            rate: 3.7505,
            lastUpdated: "Just now",
            trend: "stable",
            changePercent: "0.02%",
          },
        },
      ],
    };
  }

  if (lower.includes("ticket") || lower.includes("pass") || lower.includes("entrance")) {
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

  if (lower.includes("product detail") || lower.includes("tell me about this product") || lower.includes("product info") || lower.includes("item details")) {
    return {
      content: "Here are the full details for this product.",
      mode: "execute",
      artifacts: [
        {
          type: "product-card",
          data: {
            name: "Smart City Watch Pro",
            brand: "TechWear",
            price: "$299",
            rating: 4.7,
            reviews: 856,
            description: "Premium smartwatch with built-in city navigation, transit tracking, and ambient air quality monitoring. Perfect for the urban explorer.",
            features: ["GPS Navigation", "Heart Rate", "Air Quality", "Water Resistant", "7-Day Battery"],
            inStock: true,
          },
        },
      ],
    };
  }

  if (lower.includes("help") || lower.includes("what can you") || lower.includes("how do you work") || lower.includes("your features")) {
    return {
      content: "I'm your Dakkah Copilot \u2014 your AI concierge for the entire city. Here's what I can help with:\n\n\u2022 **Discover** places, restaurants, cafes, and hidden gems\n\u2022 **Plan** trips, itineraries, and date nights\n\u2022 **Events** \u2014 find what's happening and get tickets\n\u2022 **Book** restaurants, services, and experiences\n\u2022 **Compare** options side-by-side\n\u2022 **Track** orders and deliveries\n\u2022 **Zone Intelligence** \u2014 see what's trending in each area\n\u2022 **Progress** \u2014 earn XP, badges, and complete missions\n\u2022 **Commerce** \u2014 flash sales, product details, vendor trust profiles\n\u2022 **Finance** \u2014 invoices, credit limits, escrow tracking\n\u2022 **Health** \u2014 symptom assessment and triage\n\u2022 **Education** \u2014 course and lesson tracking\n\u2022 **Government** \u2014 permits, licenses, civic issue reporting\n\u2022 **Travel** \u2014 boarding passes, currency conversion\n\nJust tell me what you need in natural language!",
      mode: "suggest",
      artifacts: [
        { type: "selection-chips", data: { question: "Try one of these:", options: ["Show me quiet places", "Check my invoice", "My flight details", "Convert USD to SAR"] } },
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
