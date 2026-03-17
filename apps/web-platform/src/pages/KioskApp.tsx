import { useState, useEffect, useRef, useCallback } from "react";
import { SduiRenderer } from "@cityos/sdui-renderer-web";
import type { SdNode } from "@cityos/sdui-protocol";

const INACTIVITY_TIMEOUT = 60_000;
const API_BASE = `${import.meta.env.BASE_URL}api`;

interface QueueTicket {
  id: string;
  number: string;
  service: string;
  status: "waiting" | "serving" | "done";
  position: number;
}

const MOCK_QUEUE: QueueTicket[] = [
  { id: "1", number: "A-001", service: "Passport Services", status: "serving", position: 0 },
  { id: "2", number: "A-002", service: "License Renewal", status: "waiting", position: 1 },
  { id: "3", number: "A-003", service: "Civil Registry", status: "waiting", position: 2 },
  { id: "4", number: "A-004", service: "Permit Applications", status: "waiting", position: 3 },
];

const DIRECTORY = [
  { id: "gov", name: "Government Services", floor: "1F", icon: "🏛️", desc: "Passports, licenses, permits" },
  { id: "health", name: "Health Clinic", floor: "2F", icon: "🏥", desc: "Walk-in clinic & pharmacy" },
  { id: "bank", name: "Banking Center", floor: "1F", icon: "🏦", desc: "ATMs, account services" },
  { id: "post", name: "Post Office", floor: "GF", icon: "📮", desc: "Mail, parcels, stamps" },
  { id: "edu", name: "Education Center", floor: "3F", icon: "📚", desc: "Library & training rooms" },
  { id: "food", name: "Food Court", floor: "GF", icon: "🍽️", desc: "Restaurants & cafes" },
  { id: "prayer", name: "Prayer Room", floor: "1F", icon: "🕌", desc: "Open 24 hours" },
  { id: "park", name: "Parking", floor: "B1", icon: "🅿️", desc: "500 spaces, first 2hr free" },
];

const EVENTS = [
  { id: "e1", title: "Community Health Fair", date: "Today, 10 AM - 4 PM", location: "Main Hall" },
  { id: "e2", title: "Tech Job Fair", date: "Tomorrow, 9 AM - 3 PM", location: "Education Center" },
  { id: "e3", title: "Cultural Festival", date: "Fri, 5 PM - 10 PM", location: "Plaza" },
];

type KioskView = "home" | "directory" | "queue" | "events" | "wayfinding" | "search" | "emergency";

export default function KioskApp() {
  const [view, setView] = useState<KioskView>("home");
  const [search, setSearch] = useState("");
  const [sduiRoot, setSduiRoot] = useState<SdNode | null>(null);
  const [sduiLoading, setSduiLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const resetInactivity = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setView("home");
      setSearch("");
      setAlertVisible(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    const handler = () => resetInactivity();
    window.addEventListener("pointerdown", handler);
    window.addEventListener("pointermove", handler);
    resetInactivity();
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("pointermove", handler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetInactivity]);

  useEffect(() => {
    setSduiLoading(true);
    fetch(`${API_BASE}/sdui/kiosk_home?surface=kiosk`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.screen?.root) {
          setSduiRoot(json.data.screen.root);
        }
      })
      .catch(() => {})
      .finally(() => setSduiLoading(false));
  }, []);

  const filteredDirectory = search
    ? DIRECTORY.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.desc.toLowerCase().includes(search.toLowerCase())
      )
    : DIRECTORY;

  const handlePrint = useCallback(() => {
    const ticket = MOCK_QUEUE.find((t) => t.status === "waiting");
    if (ticket) {
      const w = window.open("", "_blank", "width=400,height=300");
      if (w) {
        w.document.write(`
          <html><body style="font-family:monospace;text-align:center;padding:40px">
          <h1>Queue Ticket</h1>
          <h2 style="font-size:48px;margin:20px 0">${ticket.number}</h2>
          <p>${ticket.service}</p>
          <p>Position: ${ticket.position}</p>
          <p style="font-size:12px;margin-top:20px">${new Date().toLocaleString()}</p>
          </body></html>
        `);
        w.document.close();
        w.print();
      }
    }
  }, []);

  const fullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  return (
    <div
      className="kiosk-root"
      role="application"
      aria-label="Dakkah CityOS Public Service Kiosk"
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--dt-primary-navy)",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        cursor: "default",
      }}
    >
      {alertVisible && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(220,38,38,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div style={{ fontSize: 80 }}>⚠️</div>
          <h1 style={{ fontSize: 48, fontWeight: 800 }}>EMERGENCY ALERT</h1>
          <p style={{ fontSize: 24, maxWidth: 600, textAlign: "center" }}>
            Please proceed to the nearest exit. Follow emergency personnel instructions.
          </p>
          <button
            onClick={() => setAlertVisible(false)}
            style={{
              padding: "20px 60px",
              fontSize: 20,
              fontWeight: 700,
              background: "#fff",
              color: "#dc2626",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              minHeight: 64,
            }}
          >
            DISMISS
          </button>
        </div>
      )}

      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          minHeight: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--dt-primary-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Dakkah CityOS</div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>Public Service Kiosk</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 16, opacity: 0.7 }}>
          <span>{currentTime.toLocaleDateString("en-SA", { weekday: "long", month: "long", day: "numeric" })}</span>
          <span style={{ fontSize: 28, fontWeight: 700, opacity: 1, color: "#fff" }}>
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={fullscreen}
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
            }}
            title="Toggle Fullscreen"
          >
            ⛶
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {view === "home" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 48, padding: 40 }}>
            <h1 style={{ fontSize: 42, fontWeight: 800, textAlign: "center" }}>Welcome to Dakkah City Services</h1>
            <p style={{ fontSize: 20, opacity: 0.7, textAlign: "center", maxWidth: 600 }}>Touch any service to get started</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 1000, width: "100%" }}>
              {[
                { view: "directory" as KioskView, icon: "📋", label: "Directory" },
                { view: "queue" as KioskView, icon: "🎫", label: "Queue" },
                { view: "wayfinding" as KioskView, icon: "🗺️", label: "Wayfinding" },
                { view: "events" as KioskView, icon: "📅", label: "Events" },
                { view: "search" as KioskView, icon: "🔍", label: "Search" },
                { view: "emergency" as KioskView, icon: "🆘", label: "Emergency" },
              ].map((item) => (
                <button
                  key={item.view}
                  aria-label={item.label}
                  onClick={() => item.view === "emergency" ? setAlertVisible(true) : setView(item.view)}
                  style={{
                    minHeight: 140,
                    borderRadius: 16,
                    background: item.view === "emergency" ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.08)",
                    border: item.view === "emergency" ? "2px solid #dc2626" : "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    cursor: "pointer",
                    transition: "transform 0.15s, background 0.15s",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                  onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.96)"; }}
                  onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                  onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  <span style={{ fontSize: 48 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {sduiRoot && !sduiLoading && (
              <div style={{ maxWidth: 1000, width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 24 }}>
                <SduiRenderer node={sduiRoot} theme="dark" />
              </div>
            )}
          </div>
        )}

        {view === "directory" && (
          <div style={{ flex: 1, padding: 40, overflow: "auto" }}>
            <BackButton onClick={() => setView("home")} />
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Building Directory</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filteredDirectory.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    minHeight: 100,
                  }}
                >
                  <span style={{ fontSize: 40 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 14, opacity: 0.6 }}>{d.desc}</div>
                    <div style={{ fontSize: 14, marginTop: 4, color: "var(--dt-primary-blue)", fontWeight: 600 }}>Floor: {d.floor}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "queue" && (
          <div style={{ flex: 1, padding: 40, overflow: "auto" }}>
            <BackButton onClick={() => setView("home")} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800 }}>Queue Management</h2>
              <button
                onClick={handlePrint}
                style={{
                  padding: "16px 32px",
                  fontSize: 18,
                  fontWeight: 700,
                  background: "var(--dt-primary-blue)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  minHeight: 64,
                }}
              >
                🖨️ Print Ticket
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MOCK_QUEUE.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: t.status === "serving" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.08)",
                    border: `2px solid ${t.status === "serving" ? "#10b981" : "rgba(255,255,255,0.12)"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    minHeight: 80,
                  }}
                >
                  <div style={{ fontSize: 32, fontWeight: 800, minWidth: 100 }}>{t.number}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{t.service}</div>
                    <div style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>
                      {t.status === "serving" ? "Now Serving" : `Position: ${t.position}`}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "8px 20px",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 700,
                      background: t.status === "serving" ? "#10b981" : "rgba(255,255,255,0.15)",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "events" && (
          <div style={{ flex: 1, padding: 40, overflow: "auto" }}>
            <BackButton onClick={() => setView("home")} />
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Upcoming Events</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {EVENTS.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: 28,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    minHeight: 80,
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{ev.title}</div>
                  <div style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{ev.date}</div>
                  <div style={{ fontSize: 14, color: "var(--dt-primary-blue)", fontWeight: 600, marginTop: 4 }}>📍 {ev.location}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "wayfinding" && (
          <div style={{ flex: 1, padding: 40, overflow: "auto" }}>
            <BackButton onClick={() => setView("home")} />
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Wayfinding Map</h2>
            <div style={{ borderRadius: 16, overflow: "hidden", height: "calc(100vh - 280px)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <iframe
                title="Building Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=46.62,24.68,46.74,24.72&layer=mapnik&marker=24.7136,46.6753`}
                style={{ width: "100%", height: "100%", border: "none" }}
                loading="lazy"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
              {DIRECTORY.slice(0, 4).map((d) => (
                <div key={d.id} style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.08)", textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{d.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>{d.floor}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "search" && (
          <div style={{ flex: 1, padding: 40, overflow: "auto" }}>
            <BackButton onClick={() => setView("home")} />
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Search Services</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              autoFocus
              style={{
                width: "100%",
                padding: "20px 28px",
                fontSize: 22,
                borderRadius: 16,
                border: "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)",
                color: "#fff",
                outline: "none",
                marginBottom: 24,
                minHeight: 64,
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {filteredDirectory.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    minHeight: 80,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{d.name}</div>
                    <div style={{ fontSize: 13, opacity: 0.6 }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {view !== "home" && (
        <footer
          style={{
            padding: "12px 32px",
            background: "rgba(255,255,255,0.03)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
            fontSize: 14,
            opacity: 0.4,
          }}
        >
          Touch anywhere to stay active · Auto-returns to home after 60 seconds of inactivity
        </footer>
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "14px 28px",
        fontSize: 18,
        fontWeight: 700,
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 12,
        cursor: "pointer",
        marginBottom: 20,
        minHeight: 64,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      ← Back to Home
    </button>
  );
}
