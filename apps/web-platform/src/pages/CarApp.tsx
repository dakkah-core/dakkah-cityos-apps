import { useState, useEffect, useCallback, useRef } from "react";
import { SduiRenderer } from "@cityos/sdui-renderer-web";
import type { SdNode } from "@cityos/sdui-protocol";

const API_BASE = `${import.meta.env.BASE_URL}api`;

interface CarListItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  action?: string;
}

const MAIN_MENU: CarListItem[] = [
  { id: "deliveries", icon: "📦", title: "Next Delivery", subtitle: "3.2 km · 8 min ETA" },
  { id: "navigate", icon: "🧭", title: "Navigate", subtitle: "Start turn-by-turn" },
  { id: "status", icon: "🟢", title: "Go Online", subtitle: "Accept new orders" },
  { id: "earnings", icon: "💰", title: "Today's Earnings", subtitle: "SAR 245.00" },
  { id: "voice", icon: "🎤", title: "Voice Command", subtitle: "Tap to speak" },
];

const DELIVERY_DETAILS: CarListItem[] = [
  { id: "pickup", icon: "📍", title: "Pickup: Al Baik", subtitle: "King Fahd Road, Riyadh" },
  { id: "dropoff", icon: "🏠", title: "Dropoff: Customer", subtitle: "Al Olaya District" },
  { id: "items", icon: "🍔", title: "3 Items", subtitle: "Order #D-4821" },
  { id: "call", icon: "📞", title: "Call Customer", subtitle: "+966 5X XXX XXXX" },
  { id: "back", icon: "←", title: "Back to Menu", subtitle: "" },
];

const STATUS_OPTIONS: CarListItem[] = [
  { id: "online", icon: "🟢", title: "Go Online", subtitle: "Accept new deliveries" },
  { id: "busy", icon: "🟡", title: "Busy", subtitle: "Finish current, no new" },
  { id: "offline", icon: "🔴", title: "Go Offline", subtitle: "Stop receiving orders" },
  { id: "break", icon: "☕", title: "Take Break", subtitle: "30 min pause" },
  { id: "back", icon: "←", title: "Back to Menu", subtitle: "" },
];

const NAV_STEPS: CarListItem[] = [
  { id: "s1", icon: "➡️", title: "Turn right", subtitle: "King Fahd Road · 200m" },
  { id: "s2", icon: "⬆️", title: "Continue straight", subtitle: "Olaya Street · 1.5 km" },
  { id: "s3", icon: "⬅️", title: "Turn left", subtitle: "Prince Sultan · 800m" },
  { id: "s4", icon: "🏁", title: "Destination", subtitle: "On the right · 200m" },
  { id: "back", icon: "←", title: "Back to Menu", subtitle: "" },
];

type CarView = "menu" | "delivery" | "navigate" | "status" | "earnings" | "voice";

const VOICE_RESPONSES: Record<string, string> = {
  "next delivery": "Your next delivery is at Al Baik on King Fahd Road, 3.2 km away.",
  "go online": "You are now online and accepting orders.",
  "go offline": "You are now offline.",
  earnings: "Your total earnings today are SAR 245.00 from 8 deliveries.",
  navigate: "Starting navigation to Al Olaya District. Turn right in 200 meters.",
  help: "You can say: next delivery, go online, go offline, earnings, or navigate.",
};

export default function CarApp() {
  const [view, setView] = useState<CarView>("menu");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [sduiRoot, setSduiRoot] = useState<SdNode | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/sdui/carplay_home?surface=carplay`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.screen?.root) {
          setSduiRoot(json.data.screen.root);
        }
      })
      .catch(() => {});
  }, []);

  const getCurrentList = useCallback((): CarListItem[] => {
    switch (view) {
      case "delivery": return DELIVERY_DETAILS;
      case "navigate": return NAV_STEPS;
      case "status": return STATUS_OPTIONS;
      default: return MAIN_MENU;
    }
  }, [view]);

  const handleSelect = useCallback(
    (item: CarListItem) => {
      if (item.id === "back") {
        setView("menu");
        setSelectedIdx(0);
        return;
      }
      switch (view) {
        case "menu":
          if (item.id === "deliveries") { setView("delivery"); setSelectedIdx(0); }
          else if (item.id === "navigate") { setView("navigate"); setSelectedIdx(0); }
          else if (item.id === "status") { setView("status"); setSelectedIdx(0); }
          else if (item.id === "voice") { setView("voice"); setSelectedIdx(0); }
          else if (item.id === "earnings") { setView("earnings"); setSelectedIdx(0); }
          break;
        case "status":
          if (item.id === "online") setIsOnline(true);
          else if (item.id === "offline") setIsOnline(false);
          setView("menu");
          setSelectedIdx(0);
          break;
        default:
          break;
      }
    },
    [view, isOnline],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (view === "voice") return;
      const list = getCurrentList();
      const max = Math.min(list.length, 5) - 1;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIdx((prev) => Math.min(prev + 1, max));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIdx((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          handleSelect(list[selectedIdx]);
          break;
        case "Escape":
          e.preventDefault();
          if (view !== "menu") {
            setView("menu");
            setSelectedIdx(0);
          }
          break;
      }
    },
    [view, selectedIdx, getCurrentList, handleSelect],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleVoiceSubmit = useCallback(() => {
    const lower = voiceInput.toLowerCase().trim();
    let response = "I didn't understand. Try: next delivery, earnings, navigate, go online, or help.";
    for (const [key, val] of Object.entries(VOICE_RESPONSES)) {
      if (lower.includes(key)) {
        response = val;
        break;
      }
    }
    setVoiceResponse(response);
    setVoiceInput("");
  }, [voiceInput]);

  const currentList = getCurrentList().slice(0, 5);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000000",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: "#111111",
          borderBottom: "1px solid #222",
          minHeight: 60,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--dt-primary-blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Dakkah Drive</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: isOnline ? "#10b981" : "#ef4444",
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {view === "voice" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 24 }}>
            <div style={{ fontSize: 64 }}>{isListening ? "🎤" : "🎙️"}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>Voice Command</h2>
            <p style={{ fontSize: 16, opacity: 0.5, textAlign: "center" }}>
              Type a command or say: "next delivery", "earnings", "navigate"
            </p>
            <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 400 }}>
              <input
                ref={inputRef}
                type="text"
                value={voiceInput}
                onChange={(e) => setVoiceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); handleVoiceSubmit(); } }}
                placeholder="Speak or type..."
                autoFocus
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  fontSize: 18,
                  borderRadius: 12,
                  border: "2px solid #333",
                  background: "#111",
                  color: "#fff",
                  outline: "none",
                  minHeight: 56,
                }}
              />
              <button
                onClick={() => { setIsListening(!isListening); if (!isListening) inputRef.current?.focus(); }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: isListening ? "#ef4444" : "var(--dt-primary-blue)",
                  border: "none",
                  color: "#fff",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                {isListening ? "⏹" : "🎤"}
              </button>
            </div>
            {voiceResponse && (
              <div
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: "rgba(49,130,206,0.15)",
                  border: "1px solid rgba(49,130,206,0.3)",
                  maxWidth: 400,
                  width: "100%",
                  fontSize: 16,
                  lineHeight: 1.5,
                }}
              >
                {voiceResponse}
              </div>
            )}
            <button
              onClick={() => { setView("menu"); setSelectedIdx(0); setVoiceResponse(""); }}
              style={{
                padding: "14px 32px",
                fontSize: 18,
                fontWeight: 700,
                background: "#222",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 12,
                cursor: "pointer",
                minHeight: 56,
              }}
            >
              ← Back
            </button>
          </div>
        ) : view === "earnings" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
            <div style={{ fontSize: 48 }}>💰</div>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>Today's Earnings</h2>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#10b981" }}>SAR 245.00</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 400 }}>
              <div style={{ padding: 16, borderRadius: 12, background: "#111", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>8</div>
                <div style={{ fontSize: 13, opacity: 0.5 }}>Deliveries</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: "#111", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>4.2h</div>
                <div style={{ fontSize: 13, opacity: 0.5 }}>Active Time</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: "#111", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>SAR 30.6</div>
                <div style={{ fontSize: 13, opacity: 0.5 }}>Per Delivery</div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, background: "#111", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>4.9★</div>
                <div style={{ fontSize: 13, opacity: 0.5 }}>Rating</div>
              </div>
            </div>
            <button
              onClick={() => { setView("menu"); setSelectedIdx(0); }}
              style={{
                padding: "14px 32px",
                fontSize: 18,
                fontWeight: 700,
                background: "#222",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: 12,
                cursor: "pointer",
                minHeight: 56,
                marginTop: 8,
              }}
            >
              ← Back
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                padding: "12px 24px",
                borderBottom: "1px solid #222",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                opacity: 0.5,
              }}
            >
              {view === "menu" ? "Main Menu" : view === "delivery" ? "Delivery Details" : view === "navigate" ? "Navigation" : "Driver Status"}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {currentList.map((item, idx) => {
                const isSelected = idx === selectedIdx;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 24px",
                      background: isSelected ? "rgba(49,130,206,0.15)" : "transparent",
                      border: "none",
                      borderBottom: "1px solid #222",
                      borderLeft: isSelected ? "4px solid var(--dt-primary-blue)" : "4px solid transparent",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      minHeight: 72,
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 28, width: 40, textAlign: "center" }}>{item.icon}</span>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: 14,
                            opacity: 0.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 18, opacity: 0.3 }}>›</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {sduiRoot && view === "menu" && (
          <div style={{ padding: "12px 24px", borderTop: "1px solid #222", maxHeight: 120, overflow: "hidden" }}>
            <SduiRenderer node={sduiRoot} theme="dark" />
          </div>
        )}
      </main>

      <footer
        style={{
          padding: "8px 24px",
          background: "#111",
          borderTop: "1px solid #222",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          fontSize: 12,
          opacity: 0.4,
        }}
      >
        <span>↑↓ Select</span>
        <span>·</span>
        <span>Enter Confirm</span>
        <span>·</span>
        <span>Esc Back</span>
      </footer>
    </div>
  );
}
