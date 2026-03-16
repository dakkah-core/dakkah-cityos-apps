import { useState, useCallback } from "react";
import type { DakkahAssistantProps } from "../lib/types";
import { AssistantProvider } from "../hooks/useAssistantContext";
import { ChatPanel } from "./ChatPanel";
import { FloatingButton } from "./FloatingButton";

const DEFAULT_API = "/api";

export function DakkahAssistant({
  apiEndpoint = DEFAULT_API,
  authToken,
  theme,
  position = "bottom-right",
  hostContext,
  greeting,
  placeholder,
  onAction,
  zIndex = 9999,
  defaultOpen = false,
}: DakkahAssistantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const cssVars = buildCssVars(theme);

  return (
    <AssistantProvider
      apiEndpoint={apiEndpoint}
      authToken={authToken}
      hostContext={hostContext}
      greeting={greeting}
      onAction={onAction}
    >
      <div
        className="dakkah-assistant-root"
        style={{
          position: "fixed",
          bottom: 24,
          [position === "bottom-left" ? "left" : "right"]: 24,
          zIndex,
          fontFamily: theme?.fontFamily || "system-ui, -apple-system, sans-serif",
          ...cssVars,
        }}
      >
        {isOpen && (
          <ChatPanel
            onClose={handleClose}
            onMinimize={handleToggle}
            placeholder={placeholder}
            position={position}
          />
        )}
        <FloatingButton isOpen={isOpen} onClick={handleToggle} />
      </div>
    </AssistantProvider>
  );
}

function buildCssVars(theme?: DakkahAssistantProps["theme"]): Record<string, string> {
  return {
    "--da-primary": theme?.primary || "#3182ce",
    "--da-primary-fg": theme?.primaryForeground || "#ffffff",
    "--da-bg": theme?.background || "#ffffff",
    "--da-fg": theme?.foreground || "#0a1628",
    "--da-card": theme?.card || "#f8fafc",
    "--da-card-fg": theme?.cardForeground || "#0a1628",
    "--da-border": theme?.border || "#e2e8f0",
    "--da-muted": theme?.muted || "#f1f5f9",
    "--da-muted-fg": theme?.mutedForeground || "#64748b",
    "--da-accent": theme?.accent || "#0d9488",
    "--da-radius": theme?.radius || "12px",
  };
}
