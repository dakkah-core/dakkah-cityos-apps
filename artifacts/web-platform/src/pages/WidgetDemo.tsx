import { DakkahAssistant } from "@workspace/ai-assistant-widget";

const API_BASE = `${import.meta.env.BASE_URL}api`;

export default function WidgetDemo() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <a href={import.meta.env.BASE_URL} className="text-sm text-primary hover:underline">← Back to Copilot</a>

        <div className="mt-8 mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Assistant Widget</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            The Dakkah AI Assistant is an embeddable chat widget that brings the full power of CityOS 
            to any website. It features generative SDUI rendering, voice input, and context-aware 
            conversations.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">✦ Floating action button with expand/collapse</li>
              <li className="flex items-center gap-2">✦ Text and voice input</li>
              <li className="flex items-center gap-2">✦ AI responses with inline SDUI blocks</li>
              <li className="flex items-center gap-2">✦ Context-aware (knows the host page)</li>
              <li className="flex items-center gap-2">✦ Customizable theme and position</li>
              <li className="flex items-center gap-2">✦ Message history with typing indicator</li>
              <li className="flex items-center gap-2">✦ Sandboxed action dispatch</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Integration</h3>
            <div className="rounded-lg bg-slate-900 text-green-400 p-4 text-xs font-mono overflow-x-auto">
              <pre>{`import { DakkahAssistant } from
  "@workspace/ai-assistant-widget";

<DakkahAssistant
  apiEndpoint="/api"
  position="bottom-right"
  theme={{
    primary: "#3182ce",
    background: "#ffffff",
  }}
  hostContext={{
    screenId: "my-page",
    surface: "web",
  }}
/>`}</pre>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Props</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between border-b border-border pb-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">apiEndpoint</code>
                <span className="text-muted-foreground">API base URL</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">authToken</code>
                <span className="text-muted-foreground">Bearer token</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">theme</code>
                <span className="text-muted-foreground">Color overrides</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">position</code>
                <span className="text-muted-foreground">bottom-right | bottom-left</span>
              </div>
              <div className="flex justify-between border-b border-border pb-1">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">hostContext</code>
                <span className="text-muted-foreground">Page context</span>
              </div>
              <div className="flex justify-between">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">onAction</code>
                <span className="text-muted-foreground">Action handler</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Try It</h3>
            <p className="text-sm text-muted-foreground">
              Click the floating chat button in the bottom-right corner to try the AI Assistant widget. 
              It connects to the same CityOS backend and supports all city services.
            </p>
            <div className="flex gap-3">
              <span className="inline-block px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">Live Demo</span>
              <span className="inline-block px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">Context-Aware</span>
              <span className="inline-block px-3 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">SDUI Rendering</span>
            </div>
          </div>
        </div>
      </div>

      <DakkahAssistant
        apiEndpoint={API_BASE}
        position="bottom-right"
        hostContext={{
          screenId: "widget-demo",
          surface: "web",
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }}
        greeting="Hi! I'm the Dakkah AI Assistant widget. This is a live demo — try asking me about weather, restaurants, rides, events, or city services!"
        onAction={(action) => {
          console.log("[Widget Action]", action);
        }}
      />
    </main>
  );
}
