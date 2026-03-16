import type { Artifact, Message } from "../types/chat";

interface CopilotResponse {
  content: string;
  artifacts?: Artifact[];
  mode?: "suggest" | "propose" | "execute";
}

export function processUserMessage(input: string): CopilotResponse {
  const lower = input.toLowerCase();

  if (lower.includes("quiet") || lower.includes("places near") || lower.includes("coffee") || lower.includes("cafe")) {
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

  if (lower.includes("event") || lower.includes("happening") || lower.includes("weekend") || lower.includes("tonight") || lower.includes("concert")) {
    return {
      content: "Here's what's happening around you. I've prioritized events matching your interests.",
      mode: "execute",
      artifacts: [
        {
          type: "event-carousel",
          data: {
            events: [
              { id: "e1", name: "Jazz Under Stars", date: "Tonight", time: "8:00 PM", location: "Rooftop Garden", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400", category: "Music", attendees: 128, price: "$25" },
              { id: "e2", name: "Street Food Festival", date: "This Saturday", time: "5:00 PM", location: "City Square", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400", category: "Food", attendees: 342, price: "Free" },
              { id: "e3", name: "Contemporary Art Exhibition", date: "This Week", time: "10:00 AM", location: "Modern Art Gallery", image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400", category: "Art", attendees: 89, price: "$15" },
              { id: "e4", name: "Sunset Yoga in the Park", date: "Tomorrow", time: "6:30 PM", location: "Central Park", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400", category: "Wellness", attendees: 45, price: "$10" },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("ambassador") || lower.includes("trust") || lower.includes("recommend") || lower.includes("who should")) {
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

  if (lower.includes("zone") || lower.includes("trending") || lower.includes("neighborhood") || lower.includes("area")) {
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

  if (lower.includes("order") || lower.includes("track") || lower.includes("delivery") || lower.includes("status")) {
    return {
      content: "Here's the status of your order.",
      mode: "execute",
      artifacts: [
        {
          type: "order-tracker",
          data: {
            id: "o1",
            orderNumber: "DK-2847",
            status: "on-the-way",
            items: ["Grilled Salmon", "Caesar Salad", "Sparkling Water"],
            total: "$42.50",
            estimatedTime: "15 min",
          },
        },
      ],
    };
  }

  if (lower.includes("analytics") || lower.includes("stats") || lower.includes("insights") || lower.includes("data") || lower.includes("report")) {
    return {
      content: "Here's your activity snapshot for this week.",
      mode: "execute",
      artifacts: [
        {
          type: "analytics-snapshot",
          data: {
            title: "Weekly Activity",
            metrics: [
              { label: "Places Visited", value: "12", trend: "up", trendValue: "+3" },
              { label: "XP Earned", value: "450", trend: "up", trendValue: "+120" },
              { label: "Reviews Written", value: "4", trend: "neutral", trendValue: "0" },
              { label: "Events Attended", value: "2", trend: "down", trendValue: "-1" },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("shop") || lower.includes("product") || lower.includes("buy") || lower.includes("merch")) {
    return {
      content: "Here are some products you might like based on your interests.",
      mode: "execute",
      artifacts: [
        {
          type: "product-carousel",
          data: {
            products: [
              { id: "pr1", name: "Artisan Coffee Set", brand: "Local Roasters", price: "$45", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400", tags: ["artisan", "gift"] },
              { id: "pr2", name: "City Map Print", brand: "Urban Art Co", price: "$30", image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400", tags: ["art", "decor"] },
              { id: "pr3", name: "Explorer Backpack", brand: "TrailMaker", price: "$89", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", tags: ["travel", "gear"] },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("service") || lower.includes("spa") || lower.includes("salon") || lower.includes("massage") || lower.includes("haircut")) {
    return {
      content: "Here are available services near you.",
      mode: "execute",
      artifacts: [
        {
          type: "service-menu",
          data: {
            services: [
              { id: "s1", name: "Deep Tissue Massage", description: "Full body therapeutic massage", duration: "60 min", price: "$80", rating: 4.9 },
              { id: "s2", name: "Facial Treatment", description: "Hydrating and rejuvenating", duration: "45 min", price: "$65", rating: 4.7 },
              { id: "s3", name: "Hair Styling", description: "Cut, wash, and style", duration: "30 min", price: "$40", rating: 4.8 },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("restaurant") || lower.includes("food") || lower.includes("eat") || lower.includes("lunch") || lower.includes("dinner") || lower.includes("hungry")) {
    return {
      content: "I found these top dining options nearby based on current ratings and availability.",
      mode: "execute",
      artifacts: [
        {
          type: "poi-carousel",
          data: {
            pois: [
              { id: "r1", name: "Najd Village", category: "Saudi Cuisine", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400", rating: 4.9, distance: "0.8 km", vibe: ["#authentic", "#cozy"], priceRange: "$$", openNow: true },
              { id: "r2", name: "Sakura House", category: "Japanese", image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400", rating: 4.7, distance: "1.5 km", vibe: ["#intimate", "#omakase"], priceRange: "$$$", openNow: true },
              { id: "r3", name: "Piatto", category: "Italian", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400", rating: 4.6, distance: "2.0 km", vibe: ["#romantic", "#garden"], priceRange: "$$", openNow: true },
            ],
          },
        },
        { type: "selection-chips", data: { question: "Filter by?", options: ["Cuisine type", "Price range", "Open now", "Highest rated"] } },
      ],
    };
  }

  if (lower.includes("family") || lower.includes("kid") || lower.includes("child")) {
    return {
      content: "Here are family-friendly activities perfect for all ages.",
      mode: "execute",
      artifacts: [
        {
          type: "poi-carousel",
          data: {
            pois: [
              { id: "f1", name: "Adventure Park", category: "Theme Park", image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=400", rating: 4.7, distance: "3.0 km", vibe: ["#family", "#adventure"], priceRange: "$$", openNow: true },
              { id: "f2", name: "Science Museum", category: "Museum", image: "https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=400", rating: 4.8, distance: "1.5 km", vibe: ["#educational", "#interactive"], priceRange: "$", openNow: true },
              { id: "f3", name: "City Zoo", category: "Zoo", image: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=400", rating: 4.5, distance: "5.0 km", vibe: ["#outdoor", "#animals"], priceRange: "$", openNow: true },
            ],
          },
        },
      ],
    };
  }

  if (lower.includes("help") || lower.includes("what can") || lower.includes("how do") || lower.includes("feature")) {
    return {
      content: "I'm your Dakkah Copilot \u2014 your AI concierge for the entire city. Here's what I can help with:\n\n\u2022 **Discover** places, restaurants, cafes, and hidden gems\n\u2022 **Plan** trips, itineraries, and date nights\n\u2022 **Events** \u2014 find what's happening and get tickets\n\u2022 **Book** restaurants, services, and experiences\n\u2022 **Compare** options side-by-side\n\u2022 **Track** orders and deliveries\n\u2022 **Zone Intelligence** \u2014 see what's trending in each area\n\u2022 **Progress** \u2014 earn XP, badges, and complete missions\n\nJust tell me what you need in natural language!",
      mode: "suggest",
      artifacts: [
        { type: "selection-chips", data: { question: "Try one of these:", options: ["Show me quiet places", "Plan a weekend trip", "What's happening tonight?", "How do I earn XP?"] } },
      ],
    };
  }

  return {
    content: "I understand you're looking for something. Let me help you explore. You can ask me about places, events, trip planning, bookings, zone intelligence, or anything else about the city. What interests you most?",
    mode: "suggest",
    artifacts: [
      { type: "selection-chips", data: { question: "Popular requests:", options: ["Quiet places nearby", "Plan a 3-day trip", "Trending zones", "What's happening tonight?"] } },
    ],
  };
}
