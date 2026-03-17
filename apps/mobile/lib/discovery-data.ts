import { categoryColors } from "@cityos/design-tokens/native";
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
  { id: "all", label: "All", icon: "🔲", color: categoryColors.all.fg, bgColor: categoryColors.all.bg },
  { id: "food", label: "Food & Drink", icon: "🍽️", color: categoryColors.food.fg, bgColor: categoryColors.food.bg },
  { id: "nightlife", label: "Nightlife", icon: "🌙", color: categoryColors.nightlife.fg, bgColor: categoryColors.nightlife.bg },
  { id: "culture", label: "Culture", icon: "🏛️", color: categoryColors.culture.fg, bgColor: categoryColors.culture.bg },
  { id: "wellness", label: "Wellness", icon: "🍃", color: categoryColors.wellness.fg, bgColor: categoryColors.wellness.bg },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: categoryColors.shopping.fg, bgColor: categoryColors.shopping.bg },
  { id: "services", label: "Services", icon: "🔧", color: categoryColors.services.fg, bgColor: categoryColors.services.bg },
  { id: "transit", label: "Transit", icon: "🚗", color: categoryColors.transit.fg, bgColor: categoryColors.transit.bg },
  { id: "family", label: "Family", icon: "👶", color: categoryColors.family.fg, bgColor: categoryColors.family.bg },
  { id: "work", label: "Work", icon: "💼", color: categoryColors.work.fg, bgColor: categoryColors.work.bg },
  { id: "education", label: "Education", icon: "📚", color: categoryColors.education.fg, bgColor: categoryColors.education.bg },
  { id: "home", label: "Home", icon: "🏠", color: categoryColors.home.fg, bgColor: categoryColors.home.bg },
  { id: "social", label: "Social", icon: "👥", color: categoryColors.social.fg, bgColor: categoryColors.social.bg },
  { id: "intel", label: "Intel", icon: "📈", color: categoryColors.intel.fg, bgColor: categoryColors.intel.bg },
  { id: "planning", label: "Planning", icon: "🗺️", color: categoryColors.planning.fg, bgColor: categoryColors.planning.bg },
  { id: "outdoor", label: "Outdoor", icon: "⛰️", color: categoryColors.outdoor.fg, bgColor: categoryColors.outdoor.bg },
  { id: "beauty", label: "Beauty", icon: "✨", color: categoryColors.beauty.fg, bgColor: categoryColors.beauty.bg },
  { id: "health", label: "Health", icon: "❤️", color: categoryColors.health.fg, bgColor: categoryColors.health.bg },
  { id: "my-activity", label: "My Activity", icon: "📊", color: categoryColors.myActivity.fg, bgColor: categoryColors.myActivity.bg },
  { id: "utility", label: "Utility", icon: "🛠️", color: categoryColors.utility.fg, bgColor: categoryColors.utility.bg },
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
