import { useState } from "react";
import { Search, X, MapPin, Car, Heart, Building2, Calendar, ShoppingBag, Cpu, Users, Utensils, BookOpen } from "lucide-react";
import { cn } from "@cityos/ui";
import type { DiscoveryCategory } from "@/types/chat";

const CATEGORIES: DiscoveryCategory[] = [
  { id: "transport", icon: "🚗", label: "Transport", prompts: ["Book a ride", "Check bus schedule", "Find parking nearby", "Flight status"] },
  { id: "health", icon: "🏥", label: "Healthcare", prompts: ["Find a nearby clinic", "Book an appointment", "Emergency services", "Pharmacy search"] },
  { id: "commerce", icon: "🛍️", label: "Commerce", prompts: ["Nearby restaurants", "Shopping malls open now", "Best deals today", "Order groceries"] },
  { id: "governance", icon: "🏛️", label: "Government", prompts: ["Check permit status", "Pay utility bills", "Report an issue", "City council schedule"] },
  { id: "events", icon: "🎫", label: "Events", prompts: ["Events today", "Book concert tickets", "Sports schedule", "Community meetups"] },
  { id: "education", icon: "📚", label: "Education", prompts: ["Nearby schools", "Online courses", "Library hours", "Scholarship programs"] },
  { id: "iot", icon: "📡", label: "Smart City", prompts: ["Air quality index", "Traffic cameras", "Smart parking status", "Energy consumption"] },
  { id: "social", icon: "👥", label: "Community", prompts: ["Local news", "Volunteer opportunities", "Community forums", "Neighborhood watch"] },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

export function DiscoverySidebar({ isOpen, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = search
    ? CATEGORIES.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.prompts.some((p) => p.toLowerCase().includes(search.toLowerCase()))
      )
    : CATEGORIES;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-card border-l border-border z-50 transform transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Discover Services</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 scrollbar-thin">
          {filtered.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-medium flex-1">{cat.label}</span>
                <span className="text-xs text-muted-foreground">{expandedId === cat.id ? "▲" : "▼"}</span>
              </button>
              {expandedId === cat.id && (
                <div className="px-3 pb-3 space-y-1">
                  {cat.prompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => { onSelect(prompt); onClose(); }}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
