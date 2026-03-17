import placesData from "../data/scenarios/places.json";
import cultureData from "../data/scenarios/culture.json";
import eventsData from "../data/scenarios/events.json";
import wellnessData from "../data/scenarios/wellness.json";
import commerceData from "../data/scenarios/commerce.json";
import servicesData from "../data/scenarios/services.json";
import transitData from "../data/scenarios/transit.json";
import familyData from "../data/scenarios/family.json";
import workData from "../data/scenarios/work.json";
import educationData from "../data/scenarios/education.json";
import homeData from "../data/scenarios/home.json";
import socialData from "../data/scenarios/social.json";
import intelData from "../data/scenarios/intel.json";
import planningData from "../data/scenarios/planning.json";
import outdoorData from "../data/scenarios/outdoor.json";
import beautyData from "../data/scenarios/beauty.json";
import healthData from "../data/scenarios/health.json";
import myActivityData from "../data/scenarios/my_activity.json";
import utilityData from "../data/scenarios/utility.json";

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

interface ScenarioEntry {
  id: string;
  keywords: string[];
  response: string;
  artifact?: any;
  chips?: string[];
}

export const CATEGORIES: ActionCategory[] = [
  { id: "all", label: "All", icon: "🔲", color: "#78716C", bgColor: "#F5F5F4" },
  { id: "food", label: "Food & Drink", icon: "🍽️", color: "#EA580C", bgColor: "#FFF7ED" },
  { id: "nightlife", label: "Nightlife", icon: "🌙", color: "#4F46E5", bgColor: "#EEF2FF" },
  { id: "culture", label: "Culture", icon: "🏛️", color: "#E11D48", bgColor: "#FFF1F2" },
  { id: "wellness", label: "Wellness", icon: "🍃", color: "#059669", bgColor: "#ECFDF5" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#2563EB", bgColor: "#EFF6FF" },
  { id: "services", label: "Services", icon: "🔧", color: "#475569", bgColor: "#F8FAFC" },
  { id: "transit", label: "Transit", icon: "🚗", color: "#0891B2", bgColor: "#ECFEFF" },
  { id: "family", label: "Family", icon: "👶", color: "#CA8A04", bgColor: "#FEFCE8" },
  { id: "work", label: "Work", icon: "💼", color: "#6366F1", bgColor: "#EEF2FF" },
  { id: "education", label: "Education", icon: "📚", color: "#7C3AED", bgColor: "#F5F3FF" },
  { id: "home", label: "Home", icon: "🏠", color: "#92400E", bgColor: "#FFFBEB" },
  { id: "social", label: "Social", icon: "👥", color: "#DB2777", bgColor: "#FDF2F8" },
  { id: "intel", label: "Intel", icon: "📈", color: "#0D9488", bgColor: "#F0FDFA" },
  { id: "planning", label: "Planning", icon: "🗺️", color: "#65A30D", bgColor: "#F7FEE7" },
  { id: "outdoor", label: "Outdoor", icon: "⛰️", color: "#16A34A", bgColor: "#F0FDF4" },
  { id: "beauty", label: "Beauty", icon: "✨", color: "#EC4899", bgColor: "#FDF2F8" },
  { id: "health", label: "Health", icon: "❤️", color: "#DC2626", bgColor: "#FEF2F2" },
  { id: "my-activity", label: "My Activity", icon: "📊", color: "#0EA5E9", bgColor: "#F0F9FF" },
  { id: "utility", label: "Utility", icon: "🛠️", color: "#64748B", bgColor: "#F8FAFC" },
];

function titleFromKeywords(keywords: string[]): string {
  const first = keywords[0] || "Action";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function buildUserPrompt(scenario: ScenarioEntry): string {
  if (scenario.chips && scenario.chips.length > 0) {
    const primary = scenario.keywords[0] || "this";
    return `${scenario.chips[0]} for ${primary}`;
  }
  const primary = scenario.keywords[0] || "something";
  return `Find ${primary} nearby`;
}

function extractActions(scenarios: ScenarioEntry[], category: string): QuickAction[] {
  return scenarios.map((s, i) => ({
    id: `${category}-${i}`,
    title: titleFromKeywords(s.keywords),
    prompt: buildUserPrompt(s),
    category,
  }));
}

const SCENARIO_MAP: Record<string, ScenarioEntry[]> = {
  food: placesData as ScenarioEntry[],
  nightlife: (eventsData as ScenarioEntry[]).filter((s) => s.keywords.some((k) => /bar|club|night|party|music|jazz|comedy|cocktail/i.test(k))),
  culture: cultureData as ScenarioEntry[],
  wellness: wellnessData as ScenarioEntry[],
  shopping: commerceData as ScenarioEntry[],
  services: servicesData as ScenarioEntry[],
  transit: transitData as ScenarioEntry[],
  family: familyData as ScenarioEntry[],
  work: workData as ScenarioEntry[],
  education: educationData as ScenarioEntry[],
  home: homeData as ScenarioEntry[],
  social: socialData as ScenarioEntry[],
  intel: intelData as ScenarioEntry[],
  planning: planningData as ScenarioEntry[],
  outdoor: outdoorData as ScenarioEntry[],
  beauty: beautyData as ScenarioEntry[],
  health: healthData as ScenarioEntry[],
  "my-activity": myActivityData as ScenarioEntry[],
  utility: utilityData as ScenarioEntry[],
};

export const QUICK_ACTIONS: QuickAction[] = Object.entries(SCENARIO_MAP).flatMap(
  ([category, scenarios]) => extractActions(scenarios, category)
);
