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
    case "status-tracker":
      return <StatusTracker data={d as StatusTrackerData} />;
    case "payment-card":
      return <PaymentCard data={d as PaymentData} />;
    case "schedule-card":
      return <ScheduleCard data={d as ScheduleData} />;
    case "map-preview":
      return <MapPreview data={d as MapData} />;
    case "stat-grid":
      return <StatGrid data={d as StatGridData} />;
    case "notification-list":
      return <NotificationList data={d as NotificationListData} />;
    case "form-card":
      return <FormCard data={d as FormCardData} onAction={onAction} />;
    case "profile-card":
      return <ProfileCard data={d as ProfileData} />;
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

interface StatusStep { label: string; completed: boolean; current?: boolean }
interface StatusTrackerData { title: string; status: string; steps: StatusStep[]; eta?: string }

function StatusTracker({ data }: { data: StatusTrackerData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">📋 {data.title}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{data.status}</span>
      </div>
      <div className="flex items-center gap-1">
        {data.steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step.completed ? "bg-green-500 text-white" : step.current ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              {step.completed ? "✓" : i + 1}
            </div>
            <span className="text-[10px] text-muted-foreground truncate flex-1">{step.label}</span>
            {i < data.steps.length - 1 && <div className={`h-0.5 w-4 ${step.completed ? "bg-green-500" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      {data.eta && <div className="text-xs text-muted-foreground">Estimated: {data.eta}</div>}
    </div>
  );
}

interface PaymentData { title: string; amount: string; currency: string; status: string; method?: string; date?: string }

function PaymentCard({ data }: { data: PaymentData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">💳 {data.title}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          data.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
        }`}>{data.status}</span>
      </div>
      <div className="text-2xl font-bold">{data.currency} {data.amount}</div>
      {data.method && <div className="text-xs text-muted-foreground">Method: {data.method}</div>}
      {data.date && <div className="text-xs text-muted-foreground">{data.date}</div>}
    </div>
  );
}

interface ScheduleItem { time: string; title: string; location?: string }
interface ScheduleData { title: string; date: string; items: ScheduleItem[] }

function ScheduleCard({ data }: { data: ScheduleData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-sm font-semibold">📅 {data.title} — {data.date}</div>
      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <span className="text-xs font-mono text-muted-foreground w-14 flex-shrink-0">{item.time}</span>
            <div>
              <div className="font-medium">{item.title}</div>
              {item.location && <div className="text-xs text-muted-foreground">📍 {item.location}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MapData { lat: number; lng: number; zoom?: number; markers?: { lat: number; lng: number; label: string }[] }

function MapPreview({ data }: { data: MapData }) {
  return (
    <div className="rounded-xl border border-border bg-muted p-4 space-y-2">
      <div className="text-sm font-semibold">🗺️ Map View</div>
      <div className="w-full h-40 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center text-muted-foreground text-sm">
        Map ({data.lat.toFixed(4)}, {data.lng.toFixed(4)})
        {data.markers && ` · ${data.markers.length} markers`}
      </div>
    </div>
  );
}

interface StatItem { label: string; value: string; trend?: "up" | "down"; color?: string }
interface StatGridData { title?: string; stats: StatItem[] }

function StatGrid({ data }: { data: StatGridData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      {data.title && <div className="text-sm font-semibold">{data.title}</div>}
      <div className="grid grid-cols-2 gap-3">
        {data.stats.map((stat, i) => (
          <div key={i} className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="text-lg font-bold">
              {stat.value}
              {stat.trend && <span className={`text-xs ml-1 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {stat.trend === "up" ? "↑" : "↓"}
              </span>}
            </div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface NotificationItem { id: string; title: string; body: string; time: string; read?: boolean }
interface NotificationListData { notifications: NotificationItem[] }

function NotificationList({ data }: { data: NotificationListData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="text-sm font-semibold">🔔 Notifications</div>
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
        {data.notifications.map((n) => (
          <div key={n.id} className={`flex gap-3 p-2 rounded-lg ${n.read ? "" : "bg-primary/5"}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-transparent" : "bg-primary"}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground truncate">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FormField { id: string; label: string; type: string; placeholder?: string; required?: boolean }
interface FormCardData { title: string; fields: FormField[]; submitLabel?: string; action?: string }

function FormCard({ data, onAction }: { data: FormCardData; onAction?: (action: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="text-sm font-semibold">{data.title}</div>
      <div className="space-y-2">
        {data.fields.map((field) => (
          <div key={field.id}>
            <label className="text-xs font-medium text-muted-foreground">{field.label}{field.required && " *"}</label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onAction?.(data.action || `Submit ${data.title}`)}
        className="w-full px-4 py-2 rounded-lg bg-[var(--navy)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {data.submitLabel || "Submit"}
      </button>
    </div>
  );
}

interface ProfileData { name: string; role?: string; email?: string; avatar?: string; stats?: { label: string; value: string }[] }

function ProfileCard({ data }: { data: ProfileData }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg">
          {data.avatar || "👤"}
        </div>
        <div>
          <div className="text-sm font-bold">{data.name}</div>
          {data.role && <div className="text-xs text-muted-foreground">{data.role}</div>}
          {data.email && <div className="text-xs text-muted-foreground">{data.email}</div>}
        </div>
      </div>
      {data.stats && (
        <div className="flex gap-4 pt-2 border-t border-border/50">
          {data.stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      )}
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
