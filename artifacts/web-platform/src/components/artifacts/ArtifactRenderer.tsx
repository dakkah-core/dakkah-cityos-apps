import { SduiRenderer } from "@workspace/sdui-renderer-web";
import type { SdNode } from "@workspace/sdui-protocol";
import type { Artifact } from "@/types/chat";

interface Props {
  artifacts: Artifact[];
  onAction?: (action: string) => void;
}

export function ArtifactRenderer({ artifacts, onAction }: Props) {
  return (
    <div className="space-y-2">
      {artifacts.map((artifact, i) => (
        <ArtifactItem key={i} artifact={artifact} onAction={onAction} />
      ))}
    </div>
  );
}

function ArtifactItem({ artifact, onAction }: { artifact: Artifact; onAction?: (action: string) => void }) {
  if (!artifact?.type || artifact.data === undefined) return null;

  const d = artifact.data as unknown;
  switch (artifact.type) {
    case "selection-chips":
      return <SelectionChips data={d as SelectionChipsData} onAction={onAction} />;
    case "weather-card":
      return <WeatherCard data={d as WeatherData} />;
    case "ride-status":
      return <RideStatusCard data={d as RideData} />;
    case "poi-carousel":
      return <POICarousel data={d as POIData} onAction={onAction} />;
    case "event-carousel":
      return <EventCarousel data={d as EventData} onAction={onAction} />;
    case "sdui-node":
      return <SduiRenderer node={(d as { node: SdNode }).node} theme="light" />;
    default:
      return <GenericCard artifact={artifact} onAction={onAction} />;
  }
}

interface Chip { label: string; action: string }
interface SelectionChipsData { chips: Chip[] }

function SelectionChips({ data, onAction }: { data: SelectionChipsData; onAction?: (action: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {data.chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onAction?.(chip.action)}
          className="px-3 py-2 rounded-full border border-border bg-card hover:bg-muted text-sm transition-colors"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

interface WeatherData { city: string; temp: number; condition: string; high: number; low: number; humidity: number; wind: string; forecast?: { day: string; high: number; low: number; icon: string }[] }

function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{data.temp}°C</div>
          <div className="text-sm text-muted-foreground">{data.condition} · {data.city}</div>
        </div>
        <div className="text-4xl">☀️</div>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>H: {data.high}° L: {data.low}°</span>
        <span>💧 {data.humidity}%</span>
        <span>🌬️ {data.wind}</span>
      </div>
      {data.forecast && (
        <div className="flex gap-3 pt-2 border-t border-border/50">
          {data.forecast.map((f, i) => (
            <div key={i} className="text-center text-xs">
              <div className="text-muted-foreground">{f.day}</div>
              <div className="text-lg my-1">{f.icon}</div>
              <div>{f.high}°/{f.low}°</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RideData { status: string; pickup: string; destination: string; eta: string; drivers?: { name: string; rating: number; vehicle: string; plate: string }[] }

function RideStatusCard({ data }: { data: RideData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">🚗 Ride Status</span>
        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800">{data.status}</span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2"><span className="text-green-500">●</span> {data.pickup}</div>
        <div className="flex items-center gap-2"><span className="text-red-500">●</span> {data.destination}</div>
      </div>
      <div className="text-xs text-muted-foreground">ETA: {data.eta}</div>
      {data.drivers?.map((d, i) => (
        <div key={i} className="flex items-center gap-3 pt-2 border-t border-border/50">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">👤</div>
          <div className="flex-1">
            <div className="text-sm font-medium">{d.name} ⭐ {d.rating}</div>
            <div className="text-xs text-muted-foreground">{d.vehicle} · {d.plate}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface POIItem { id: string; name: string; category: string; rating: number; distance: string; image?: string }
interface POIData { title: string; items: POIItem[] }

function POICarousel({ data, onAction }: { data: POIData; onAction?: (action: string) => void }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{data.title}</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {data.items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAction?.(`Tell me more about ${item.name}`)}
            className="flex-shrink-0 w-48 rounded-xl border border-border bg-card p-3 text-left hover:bg-muted transition-colors"
          >
            <div className="w-full h-24 rounded-lg bg-muted mb-2 flex items-center justify-center text-2xl">🏪</div>
            <div className="text-sm font-medium truncate">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.category} · ⭐ {item.rating}</div>
            <div className="text-xs text-muted-foreground">{item.distance}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface EventItem { id: string; title: string; venue: string; time: string; category: string }
interface EventData { title: string; items: EventItem[] }

function EventCarousel({ data, onAction }: { data: EventData; onAction?: (action: string) => void }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">{data.title}</h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {data.items.map((item) => (
          <button
            key={item.id}
            onClick={() => onAction?.(`Tell me about ${item.title}`)}
            className="flex-shrink-0 w-52 rounded-xl border border-border bg-card p-3 text-left hover:bg-muted transition-colors"
          >
            <div className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-block mb-2">{item.category}</div>
            <div className="text-sm font-medium">{item.title}</div>
            <div className="text-xs text-muted-foreground mt-1">📍 {item.venue}</div>
            <div className="text-xs text-muted-foreground">🕐 {item.time}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GenericCard({ artifact, onAction }: { artifact: Artifact; onAction?: (action: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{artifact.type.replace(/-/g, " ")}</div>
      <pre className="text-xs bg-muted p-2 rounded-lg overflow-x-auto max-h-32">
        {JSON.stringify(artifact.data, null, 2)}
      </pre>
      {onAction && (
        <button onClick={() => onAction(`Show more about ${artifact.type}`)} className="text-xs text-primary mt-2 hover:underline">
          View details →
        </button>
      )}
    </div>
  );
}
