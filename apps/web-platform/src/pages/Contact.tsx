import { useState } from "react";
import { Mail, MapPin, Phone, Globe, Loader2, Check } from "lucide-react";
import { queueMutation } from "@/lib/offline-store";

const API_BASE = `${import.meta.env.BASE_URL}api`;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "queued">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("sending");

    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      await queueMutation({
        endpoint: `${API_BASE}/contact`,
        method: "POST",
        body: form,
      });
      setStatus("queued");
    }

    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <a href={import.meta.env.BASE_URL} className="text-sm text-primary hover:underline">← Back to Copilot</a>
        <h1 className="text-3xl font-bold mt-6 mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We'd love to hear from you. Reach out through any of these channels.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <Mail className="h-6 w-6 text-primary" />
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">support@dakkah.city</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <Phone className="h-6 w-6 text-primary" />
            <h3 className="font-semibold">Phone</h3>
            <p className="text-sm text-muted-foreground">+966 11 XXX XXXX</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h3 className="font-semibold">Address</h3>
            <p className="text-sm text-muted-foreground">King Fahd Road, Riyadh, Saudi Arabia</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <Globe className="h-6 w-6 text-primary" />
            <h3 className="font-semibold">Developer Portal</h3>
            <p className="text-sm text-muted-foreground">developers.dakkah.city</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-4">Send a Message</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            <textarea
              placeholder="Your message... *"
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={status === "sending"}
                className="px-6 py-2.5 rounded-lg bg-[var(--navy)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {status === "sending" ? (
                  <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Sending...</span>
                ) : "Send Message"}
              </button>
              {status === "sent" && (
                <span className="flex items-center gap-1 text-sm text-green-600"><Check className="h-4 w-4" /> Message sent!</span>
              )}
              {status === "queued" && (
                <span className="text-sm text-amber-600">Queued — will send when back online</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
