export default function About() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <a href={import.meta.env.BASE_URL} className="text-sm text-primary hover:underline">← Back to Copilot</a>
        <h1 className="text-3xl font-bold mt-6 mb-4">About Dakkah CityOS</h1>
        <section className="prose prose-sm text-foreground space-y-4">
          <p>
            Dakkah CityOS is a universal super app platform that unifies every city service into a single AI-powered conversation. Instead of navigating dozens of separate apps, citizens interact with one intelligent copilot that understands context, anticipates needs, and orchestrates services seamlessly.
          </p>
          <h2 className="text-xl font-semibold mt-8">Our Vision</h2>
          <p>
            We believe cities should work for people, not the other way around. By eliminating app fatigue and fragmented digital experiences, Dakkah creates a unified layer where transport, healthcare, commerce, governance, education, and community services coexist naturally.
          </p>
          <h2 className="text-xl font-semibold mt-8">How It Works</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>AI Copilot</strong> — A conversational interface that understands your intent and connects you to the right service instantly.</li>
            <li><strong>Server-Driven UI</strong> — Dynamic interfaces that adapt in real-time based on context, location, and user preferences.</li>
            <li><strong>18 App Families</strong> — Over 80 surfaces spanning transport, health, commerce, governance, IoT, education, and more.</li>
            <li><strong>Offline-First PWA</strong> — Works without connectivity, syncs when back online, installable on any device.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8">Technology</h2>
          <p>
            Built on a modern stack with React, Vite, and a microservices BFF architecture. The SDUI protocol allows the backend to control UI rendering, enabling instant updates without app store deployments.
          </p>
        </section>
      </div>
    </main>
  );
}
