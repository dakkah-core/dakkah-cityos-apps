import { Mail, MapPin, Phone, Globe } from "lucide-react";

export default function Contact() {
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
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input type="text" placeholder="Name" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
              <input type="email" placeholder="Email" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
            </div>
            <input type="text" placeholder="Subject" className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50" />
            <textarea placeholder="Your message..." rows={4} className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none" />
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-[var(--navy)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
