import { useState, useEffect, useCallback, useRef } from "react";
import { SduiRenderer } from "@cityos/sdui-renderer-web";
import type { SdNode } from "@cityos/sdui-protocol";

const API_BASE = `${import.meta.env.BASE_URL}api`;

interface ContentSlide {
  id: string;
  title: string;
  category: string;
  items: { id: string; title: string; subtitle?: string; image?: string; badge?: string }[];
}

const CONTENT_SLIDES: ContentSlide[] = [
  {
    id: "restaurants",
    title: "Popular Restaurants",
    category: "🍽️ Dining",
    items: [
      { id: "r1", title: "Al Baik", subtitle: "Fast Food · $$", image: "https://placehold.co/400x225/1e293b/3182ce?text=Al+Baik", badge: "4.8★" },
      { id: "r2", title: "The Globe", subtitle: "Fine Dining · $$$$", image: "https://placehold.co/400x225/1e293b/3182ce?text=The+Globe", badge: "4.9★" },
      { id: "r3", title: "Nusret", subtitle: "Steakhouse · $$$", image: "https://placehold.co/400x225/1e293b/3182ce?text=Nusret", badge: "4.7★" },
      { id: "r4", title: "Mama Noura", subtitle: "Saudi Cuisine · $$", image: "https://placehold.co/400x225/1e293b/3182ce?text=Mama+Noura", badge: "4.6★" },
      { id: "r5", title: "LPM Restaurant", subtitle: "French · $$$$", image: "https://placehold.co/400x225/1e293b/3182ce?text=LPM", badge: "4.8★" },
    ],
  },
  {
    id: "events",
    title: "This Week's Events",
    category: "📅 Events",
    items: [
      { id: "e1", title: "Riyadh Season", subtitle: "Dec 15 - Mar 30", image: "https://placehold.co/400x225/1e293b/d97706?text=Riyadh+Season" },
      { id: "e2", title: "Art Exhibition", subtitle: "National Museum", image: "https://placehold.co/400x225/1e293b/d97706?text=Art+Show" },
      { id: "e3", title: "Tech Summit", subtitle: "KAFD Conference Center", image: "https://placehold.co/400x225/1e293b/d97706?text=Tech+Summit" },
      { id: "e4", title: "Food Festival", subtitle: "Boulevard Riyadh City", image: "https://placehold.co/400x225/1e293b/d97706?text=Food+Fest" },
    ],
  },
  {
    id: "weather",
    title: "City Information",
    category: "🌤️ City",
    items: [
      { id: "w1", title: "Weather: 34°C", subtitle: "Sunny · Clear skies", badge: "☀️" },
      { id: "w2", title: "Air Quality: Good", subtitle: "AQI: 42", badge: "🌿" },
      { id: "w3", title: "Traffic: Moderate", subtitle: "King Fahd Road: 15 min delay", badge: "🚗" },
      { id: "w4", title: "Prayer Times", subtitle: "Maghrib: 5:42 PM", badge: "🕌" },
    ],
  },
  {
    id: "services",
    title: "City Services",
    category: "🏙️ Services",
    items: [
      { id: "s1", title: "Parking Available", subtitle: "2,340 spots near you", badge: "🅿️" },
      { id: "s2", title: "Public Transport", subtitle: "Metro Line 1: On Time", badge: "🚇" },
      { id: "s3", title: "Emergency: 999", subtitle: "Police · Fire · Ambulance", badge: "🆘" },
      { id: "s4", title: "Report Issue", subtitle: "Scan QR or call 940", badge: "📱" },
    ],
  },
];

const AUTO_SCROLL_INTERVAL = 8000;

export default function TvApp() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedCol, setFocusedCol] = useState(0);
  const [isPassive, setIsPassive] = useState(true);
  const [sduiRoot, setSduiRoot] = useState<SdNode | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewportScale, setViewportScale] = useState(() =>
    Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
  );

  useEffect(() => {
    const onResize = () =>
      setViewportScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/sdui/tv_home?surface=tv_1080p`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.screen?.root) {
          setSduiRoot(json.data.screen.root);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isPassive) {
      autoRef.current = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % CONTENT_SLIDES.length);
      }, AUTO_SCROLL_INTERVAL);
    }
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [isPassive]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isPassive) {
        setIsPassive(false);
        return;
      }

      const slide = CONTENT_SLIDES[activeSlide];
      const maxCol = slide.items.length - 1;
      const maxRow = CONTENT_SLIDES.length;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedCol((prev) => Math.min(prev + 1, maxCol));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedCol((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          if (focusedRow < maxRow - 1) {
            setFocusedRow((prev) => prev + 1);
            setActiveSlide((prev) => Math.min(prev + 1, CONTENT_SLIDES.length - 1));
            setFocusedCol(0);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (focusedRow > 0) {
            setFocusedRow((prev) => prev - 1);
            setActiveSlide((prev) => Math.max(prev - 1, 0));
            setFocusedCol(0);
          }
          break;
        case "Enter":
          e.preventDefault();
          break;
        case "Escape":
          e.preventDefault();
          setIsPassive(true);
          break;
      }
    },
    [isPassive, activeSlide, focusedRow],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentSlide = CONTENT_SLIDES[activeSlide];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
    <div
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${viewportScale})`,
        transformOrigin: "center center",
        background: "linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0a1628 100%)",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        position: "relative",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 48px",
          minHeight: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#3182ce",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Dakkah CityOS</div>
            <div style={{ fontSize: 14, opacity: 0.5 }}>Smart Display</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {!isPassive && (
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "rgba(49,130,206,0.3)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ↑↓←→ Navigate · Enter Select · Esc Passive
            </div>
          )}
          <div style={{ fontSize: 14, opacity: 0.6 }}>
            {currentTime.toLocaleDateString("en-SA", { weekday: "short", month: "short", day: "numeric" })}
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 48px", gap: 24, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span style={{ fontSize: 16, opacity: 0.5, marginRight: 12 }}>{currentSlide.category}</span>
            <span style={{ fontSize: 32, fontWeight: 800 }}>{currentSlide.title}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {CONTENT_SLIDES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === activeSlide ? 32 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === activeSlide ? "#3182ce" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => { setActiveSlide(i); setIsPassive(false); setFocusedCol(0); }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            overflow: "hidden",
            paddingBottom: 16,
          }}
        >
          {currentSlide.items.map((item, idx) => {
            const isFocused = !isPassive && idx === focusedCol;
            return (
              <div
                key={item.id}
                style={{
                  flex: "0 0 auto",
                  width: 320,
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "rgba(255,255,255,0.06)",
                  border: isFocused ? "3px solid #3182ce" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isFocused ? "0 0 0 4px rgba(49,130,206,0.3)" : "none",
                  transform: isFocused ? "scale(1.04)" : "scale(1)",
                  transition: "all 0.2s ease-out",
                }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "100%", height: 180, objectFit: "cover" }}
                    loading="lazy"
                  />
                )}
                <div style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, flex: 1 }}>{item.title}</div>
                    {item.badge && (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: "rgba(49,130,206,0.3)",
                          fontSize: 13,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: 15, opacity: 0.6, marginTop: 6 }}>{item.subtitle}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sduiRoot && (
          <div style={{ maxWidth: "100%", background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, overflow: "hidden" }}>
            <SduiRenderer node={sduiRoot} theme="dark" />
          </div>
        )}
      </div>

      <footer
        style={{
          padding: "16px 48px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: 0.4,
          fontSize: 14,
        }}
      >
        <span>Dakkah CityOS · Powered by SDUI</span>
        <span>{isPassive ? "Auto-scrolling · Press any key to interact" : "Interactive Mode"}</span>
      </footer>
    </div>
    </div>
  );
}
