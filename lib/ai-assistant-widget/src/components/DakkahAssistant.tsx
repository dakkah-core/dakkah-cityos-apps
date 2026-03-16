import { useState, useCallback, useEffect, useRef } from "react";
import type { DakkahAssistantProps } from "../lib/types";
import { AssistantProvider } from "../hooks/useAssistantContext";
import { ChatPanel } from "./ChatPanel";
import { FloatingButton } from "./FloatingButton";
import { configureActionHandler } from "@workspace/sdui-renderer-web";

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
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  useEffect(() => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const executeViaBackend = async (intent: string, params: Record<string, unknown>) => {
      const res = await fetch(`${apiEndpoint}/ai/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify({ intent, params }),
      });
      if (res.ok) return await res.json();
      return { success: false };
    };

    configureActionHandler({
      onNavigate: (screen, params) => {
        onActionRef.current?.({ type: "navigate", screen, params });
      },
      onMutation: async (endpoint, method, payload) => {
        const result = await executeViaBackend("api_mutation", { endpoint, method, payload });
        onActionRef.current?.({ type: "api_mutation", endpoint, method, payload, result });
        return result;
      },
      onIntent: async (intent, data) => {
        const result = await executeViaBackend(intent, data || {});
        onActionRef.current?.({ type: "intent", intent, data, result });
      },
      onFormSubmit: async (formId, endpoint, method, formData) => {
        const result = await executeViaBackend("submit_form", { formId, endpoint, method, formData });
        onActionRef.current?.({ type: "submit_form", formId, endpoint, formData, result });
        return result;
      },
    });
  }, [apiEndpoint, authToken]);

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
