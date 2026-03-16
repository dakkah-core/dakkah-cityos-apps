export interface ActionCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface QuickAction {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export const CATEGORIES: ActionCategory[] = [
  { id: "all", label: "All", icon: "grid", color: "#78716C", bgColor: "#F5F5F4" },
  { id: "food", label: "Food & Drink", icon: "utensils", color: "#EA580C", bgColor: "#FFF7ED" },
  { id: "nightlife", label: "Nightlife", icon: "moon", color: "#4F46E5", bgColor: "#EEF2FF" },
  { id: "culture", label: "Culture", icon: "landmark", color: "#E11D48", bgColor: "#FFF1F2" },
  { id: "wellness", label: "Wellness", icon: "leaf", color: "#059669", bgColor: "#ECFDF5" },
  { id: "shopping", label: "Shopping", icon: "shopping-bag", color: "#2563EB", bgColor: "#EFF6FF" },
  { id: "services", label: "Services", icon: "wrench", color: "#475569", bgColor: "#F8FAFC" },
  { id: "transit", label: "Transit", icon: "car", color: "#0891B2", bgColor: "#ECFEFF" },
  { id: "family", label: "Family", icon: "baby", color: "#CA8A04", bgColor: "#FEFCE8" },
  { id: "outdoor", label: "Outdoor", icon: "mountain", color: "#16A34A", bgColor: "#F0FDF4" },
  { id: "planning", label: "Planning", icon: "map", color: "#65A30D", bgColor: "#F7FEE7" },
  { id: "social", label: "Social", icon: "users", color: "#DB2777", bgColor: "#FDF2F8" },
  { id: "intel", label: "Intel", icon: "trending-up", color: "#0D9488", bgColor: "#F0FDFA" },
  { id: "health", label: "Health", icon: "heart", color: "#DC2626", bgColor: "#FEF2F2" },
];

export const QUICK_ACTIONS: QuickAction[] = [
  { id: "101", title: "Coffee Shops", prompt: "Find the best coffee shops nearby", category: "food" },
  { id: "102", title: "Healthy Eats", prompt: "Find healthy dining options nearby", category: "food" },
  { id: "103", title: "Fine Dining", prompt: "Find a fine dining experience", category: "food" },
  { id: "104", title: "Street Food", prompt: "Where are the best street food spots?", category: "food" },
  { id: "105", title: "Brunch Spots", prompt: "Find a great place for brunch", category: "food" },
  { id: "106", title: "Bakeries", prompt: "Where is the nearest artisan bakery?", category: "food" },

  { id: "201", title: "Rooftop Bars", prompt: "Show me rooftop bars with a view", category: "nightlife" },
  { id: "202", title: "Live Music", prompt: "Find live music venues open now", category: "nightlife" },
  { id: "203", title: "Cocktails", prompt: "Where can I get good cocktails?", category: "nightlife" },
  { id: "204", title: "Comedy", prompt: "Find a comedy club", category: "nightlife" },
  { id: "205", title: "Jazz Bars", prompt: "Find a cozy jazz bar", category: "nightlife" },

  { id: "301", title: "Museums", prompt: "List the top museums in the city", category: "culture" },
  { id: "302", title: "Art Galleries", prompt: "Show me current art exhibitions", category: "culture" },
  { id: "303", title: "Architecture", prompt: "Show me notable architecture nearby", category: "culture" },
  { id: "304", title: "Theatre", prompt: "What plays are showing?", category: "culture" },
  { id: "305", title: "Historical Sites", prompt: "Show me historical sites", category: "culture" },

  { id: "401", title: "Yoga", prompt: "Find yoga studios near me", category: "wellness" },
  { id: "402", title: "Spa Day", prompt: "Find the best spas nearby", category: "wellness" },
  { id: "403", title: "Meditation", prompt: "Find meditation centers", category: "wellness" },
  { id: "404", title: "Gym", prompt: "Find a gym with day passes", category: "wellness" },

  { id: "501", title: "Malls", prompt: "Find shopping malls nearby", category: "shopping" },
  { id: "502", title: "Boutiques", prompt: "Find unique fashion boutiques", category: "shopping" },
  { id: "503", title: "Markets", prompt: "Are there any flea markets open?", category: "shopping" },
  { id: "504", title: "Electronics", prompt: "Where can I buy electronics?", category: "shopping" },

  { id: "601", title: "Legal Aid", prompt: "Find lawyers and notaries", category: "services" },
  { id: "602", title: "Auto Repair", prompt: "Find mechanics nearby", category: "services" },
  { id: "603", title: "Banks", prompt: "Find an ATM or bank branch", category: "services" },

  { id: "701", title: "Ride Hailing", prompt: "Call a ride to downtown", category: "transit" },
  { id: "702", title: "Public Transit", prompt: "Show me transit options", category: "transit" },
  { id: "703", title: "Parking", prompt: "Find parking near me", category: "transit" },

  { id: "801", title: "Kids Activities", prompt: "Find family-friendly activities", category: "family" },
  { id: "802", title: "Playgrounds", prompt: "Find playgrounds nearby", category: "family" },
  { id: "803", title: "Family Dining", prompt: "Find kid-friendly restaurants", category: "family" },

  { id: "901", title: "Hiking", prompt: "Find hiking trails nearby", category: "outdoor" },
  { id: "902", title: "Parks", prompt: "Show me parks and gardens", category: "outdoor" },
  { id: "903", title: "Cycling", prompt: "Find bike rental stations", category: "outdoor" },

  { id: "1001", title: "Weekend Trip", prompt: "Plan a weekend getaway", category: "planning" },
  { id: "1002", title: "Date Night", prompt: "Create a date night plan", category: "planning" },
  { id: "1003", title: "3-Day Trip", prompt: "Plan a 3-day Riyadh experience", category: "planning" },

  { id: "1101", title: "Meetups", prompt: "Find social meetups nearby", category: "social" },
  { id: "1102", title: "Networking", prompt: "Find networking events", category: "social" },

  { id: "1201", title: "Trending Zones", prompt: "What zones are trending now?", category: "intel" },
  { id: "1202", title: "Compare Areas", prompt: "Compare neighborhoods", category: "intel" },
  { id: "1203", title: "My Stats", prompt: "Show me my activity stats", category: "intel" },

  { id: "1301", title: "Pharmacies", prompt: "Find pharmacies open now", category: "health" },
  { id: "1302", title: "Clinics", prompt: "Find walk-in clinics", category: "health" },
];
