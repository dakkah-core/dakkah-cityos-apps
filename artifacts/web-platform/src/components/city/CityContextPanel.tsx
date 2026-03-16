import { useState, useEffect } from "react";
import { Cloud, Thermometer, Wind, Droplets, AlertTriangle, Clock, MapPin } from "lucide-react";
import { cacheSduiScreen, getCachedSduiScreen } from "@/lib/offline-store";

interface CityData {
  weather: { temp: number; condition: string; humidity: number; wind: string; aqi: number };
  alerts: { id: string; type: string; message: string; severity: "info" | "warning" | "critical" }[];
  stats: { label: string; value: string; trend?: "up" | "down" }[];
}

const DEMO_CITY_DATA: CityData = {
  weather: { temp: 38, condition: "Sunny", humidity: 15, wind: "12 km/h NE", aqi: 78 },
  alerts: [
    { id: "1", type: "Traffic", message: "Heavy traffic on King Fahd Road", severity: "warning" },
    { id: "2", type: "Event", message: "National Day celebrations — road closures downtown", severity: "info" },
  ],
  stats: [
    { label: "Active Users", value: "1.2M", trend: "up" },
    { label: "Transit Load", value: "72%", trend: "up" },
    { label: "Air Quality", value: "Good", trend: "down" },
    { label: "Open Issues", value: "342" },
  ],
};

const API_BASE = `${import.meta.env.BASE_URL}api`;

async function fetchCityContext(): Promise<CityData> {
  try {
    const res = await fetch(`${API_BASE}/sdui/screen/citizen_home?surface=web`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      await cacheSduiScreen("citizen_home_web", data);
      return data.cityContext || DEMO_CITY_DATA;
    }
  } catch {
    const cached = await getCachedSduiScreen("citizen_home_web");
    if (cached && typeof cached === "object") {
      const ctx = (cached as Record<string, unknown>).cityContext;
      if (ctx) return ctx as CityData;
    }
  }
  return DEMO_CITY_DATA;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CityContextPanel({ isOpen, onClose }: Props) {
  const [data, setData] = useState<CityData>(DEMO_CITY_DATA);

  useEffect(() => {
    if (isOpen) {
      fetchCityContext().then(setData);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4 space-y-4 max-h-48 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">City Context — Riyadh</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm font-bold">{data.weather.temp}°C</div>
              <div className="text-[10px] text-muted-foreground">{data.weather.condition}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Wind className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-bold">{data.weather.wind}</div>
              <div className="text-[10px] text-muted-foreground">Wind</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Droplets className="h-4 w-4 text-cyan-500" />
            <div>
              <div className="text-sm font-bold">{data.weather.humidity}%</div>
              <div className="text-[10px] text-muted-foreground">Humidity</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Cloud className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-bold">AQI {data.weather.aqi}</div>
              <div className="text-[10px] text-muted-foreground">Air Quality</div>
            </div>
          </div>
        </div>

        {data.alerts.length > 0 && (
          <div className="space-y-1">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                  alert.severity === "critical"
                    ? "bg-red-500/10 text-red-600"
                    : alert.severity === "warning"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-blue-500/10 text-blue-600"
                }`}
              >
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                <span className="font-medium">{alert.type}:</span>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
