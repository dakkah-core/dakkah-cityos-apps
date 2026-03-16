import { useState, useRef, useEffect, useCallback } from "react";
import { Minimize2, Trash2, Send, Mic, MicOff, GripVertical } from "lucide-react";
import { useAssistantContext } from "../hooks/useAssistantContext";
import { MessageBubble } from "./MessageBubble";
import type { AssistantPosition } from "../lib/types";

interface ChatPanelProps {
  onClose: () => void;
  onMinimize: () => void;
  placeholder?: string;
  position: AssistantPosition;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 400;
const MAX_WIDTH = 640;
const MAX_HEIGHT = 800;

export function ChatPanel({ onClose, onMinimize, placeholder, position }: ChatPanelProps) {
  const { messages, isProcessing, sendMessage, clearHistory } = useAssistantContext();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [panelSize, setPanelSize] = useState({ width: 380, height: 520 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartRef.current = { x: e.clientX, y: e.clientY, w: panelSize.width, h: panelSize.height };

    const handleMove = (ev: PointerEvent) => {
      if (!isResizingRef.current) return;
      const dx = resizeStartRef.current.x - ev.clientX;
      const dy = resizeStartRef.current.y - ev.clientY;
      const newW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, resizeStartRef.current.w + dx));
      const newH = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, resizeStartRef.current.h + dy));
      setPanelSize({ width: newW, height: newH });
    };

    const handleUp = () => {
      isResizingRef.current = false;
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
  }, [panelSize]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isProcessing) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  }, [input, isProcessing, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const toggleVoice = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      return;
    }

    if (isListening) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    const recognition = new (SpeechRecognition as new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: (e: { results: { item: (i: number) => { item: (j: number) => { transcript: string } } }; resultIndex: number }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    })();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: unknown) => {
      const e = event as { results: Array<Array<{ transcript: string }>> };
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const alignRight = position === "bottom-right";

  return (
    <div
      style={{
        width: panelSize.width,
        maxWidth: "calc(100vw - 48px)",
        height: panelSize.height,
        maxHeight: "calc(100vh - 120px)",
        borderRadius: "var(--da-radius)",
        background: "var(--da-bg)",
        border: "1px solid var(--da-border)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "da-slide-up 0.25s ease-out",
        [alignRight ? "marginLeft" : "marginRight"]: "auto",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes da-slide-up {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes da-typing {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
      `}</style>

      <div
        onPointerDown={handleResizeStart}
        style={{
          position: "absolute",
          top: 0,
          [alignRight ? "left" : "right"]: 0,
          width: 20,
          height: 20,
          cursor: alignRight ? "nw-resize" : "ne-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          opacity: 0.4,
          transition: "opacity 0.15s",
        }}
        onPointerEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.4"; }}
        title="Drag to resize"
      >
        <GripVertical size={10} style={{ color: "var(--da-primary-fg)" }} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          borderBottom: "1px solid var(--da-border)",
          background: "var(--da-primary)",
          color: "var(--da-primary-fg)",
          borderRadius: "var(--da-radius) var(--da-radius) 0 0",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          ✦
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Dakkah Assistant</div>
          <div style={{ fontSize: 10, opacity: 0.8, lineHeight: 1.2 }}>AI-powered city copilot</div>
        </div>
        <button
          onClick={clearHistory}
          title="Clear history"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: 6,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={onMinimize}
          title="Minimize"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            borderRadius: 6,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          <Minimize2 size={14} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isProcessing && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 4 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--da-muted-fg)",
                    animation: `da-typing 1.4s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 11, color: "var(--da-muted-fg)", fontStyle: "italic" }}>
              Thinking...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid var(--da-border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--da-card)",
        }}
      >
        <button
          onClick={toggleVoice}
          title={isListening ? "Stop listening" : "Voice input"}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isListening ? "#ef4444" : "var(--da-muted)",
            color: isListening ? "#fff" : "var(--da-muted-fg)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask Dakkah anything..."}
          disabled={isProcessing}
          style={{
            flex: 1,
            border: "1px solid var(--da-border)",
            borderRadius: 20,
            padding: "8px 14px",
            fontSize: 13,
            background: "var(--da-bg)",
            color: "var(--da-fg)",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isProcessing}
          title="Send"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: input.trim() && !isProcessing ? "var(--da-primary)" : "var(--da-muted)",
            color: input.trim() && !isProcessing ? "var(--da-primary-fg)" : "var(--da-muted-fg)",
            border: "none",
            cursor: input.trim() && !isProcessing ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
