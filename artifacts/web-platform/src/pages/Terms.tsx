export default function Terms() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <a href={import.meta.env.BASE_URL} className="text-sm text-primary hover:underline">← Back to Copilot</a>
        <h1 className="text-3xl font-bold mt-6 mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>
        <div className="prose prose-sm text-foreground space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>By using Dakkah CityOS, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>
          <h2 className="text-xl font-semibold mt-6">2. Service Description</h2>
          <p>Dakkah CityOS is a unified platform that connects citizens with city services through an AI copilot interface. Services include but are not limited to transport, healthcare, commerce, and governance.</p>
          <h2 className="text-xl font-semibold mt-6">3. User Responsibilities</h2>
          <p>Users must provide accurate information, maintain account security, and use the platform in compliance with local laws and regulations.</p>
          <h2 className="text-xl font-semibold mt-6">4. Service Availability</h2>
          <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. The PWA offline mode provides cached access during outages.</p>
          <h2 className="text-xl font-semibold mt-6">5. Intellectual Property</h2>
          <p>All content, design, and technology of Dakkah CityOS are the property of Dakkah Core. Users retain ownership of their personal data.</p>
          <h2 className="text-xl font-semibold mt-6">6. Limitation of Liability</h2>
          <p>Dakkah CityOS acts as an intermediary between citizens and city services. We are not liable for service quality from third-party providers.</p>
          <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
          <p>For legal inquiries: legal@dakkah.city</p>
        </div>
      </div>
    </main>
  );
}
