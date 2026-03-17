export default function Privacy() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <a href={import.meta.env.BASE_URL} className="text-sm text-primary hover:underline">← Back to Copilot</a>
        <h1 className="text-3xl font-bold mt-6 mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2026</p>
        <div className="prose prose-sm text-foreground space-y-4">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>Dakkah CityOS collects information necessary to provide city services: account information (name, email), conversation history, location data (with consent), and usage analytics.</p>
          <h2 className="text-xl font-semibold mt-6">2. How We Use Your Information</h2>
          <p>Your data is used to personalize the copilot experience, route requests to appropriate city services, improve service quality, and ensure platform security.</p>
          <h2 className="text-xl font-semibold mt-6">3. Data Sharing</h2>
          <p>We share information only with the city service providers necessary to fulfill your requests. We do not sell personal data to third parties.</p>
          <h2 className="text-xl font-semibold mt-6">4. Data Security</h2>
          <p>All data is encrypted in transit (TLS 1.3) and at rest. Authentication uses industry-standard PKCE OAuth 2.0 flows via Keycloak.</p>
          <h2 className="text-xl font-semibold mt-6">5. Your Rights</h2>
          <p>You have the right to access, correct, delete, and export your personal data. Contact privacy@dakkah.city for requests.</p>
          <h2 className="text-xl font-semibold mt-6">6. Cookies & Local Storage</h2>
          <p>We use session storage for authentication tokens and IndexedDB for offline data caching. No third-party tracking cookies are used.</p>
          <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
          <p>For privacy inquiries: privacy@dakkah.city</p>
        </div>
      </div>
    </main>
  );
}
