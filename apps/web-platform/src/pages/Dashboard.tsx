import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { ThreadsSidebar } from "@/components/layout/ThreadsSidebar";
import { DiscoverySidebar } from "@/components/discovery/DiscoverySidebar";
import { CityContextPanel } from "@/components/city/CityContextPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { useChat } from "@/hooks/use-chat";

export default function Dashboard() {
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [cityContextOpen, setCityContextOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { sendMessage } = useChat();

  const handleDiscoverySelect = useCallback(async (prompt: string) => {
    await sendMessage(prompt);
  }, [sendMessage]);

  const handleSearch = useCallback(async (query: string) => {
    if (query) await sendMessage(query);
  }, [sendMessage]);

  return (
    <div className="h-screen flex flex-col">
      <Header
        onToggleThreads={() => setThreadsOpen(!threadsOpen)}
        onToggleDiscovery={() => setDiscoveryOpen(!discoveryOpen)}
        onToggleSearch={() => setSearchOpen(true)}
        onToggleCityContext={() => setCityContextOpen(!cityContextOpen)}
      />
      <OfflineBanner />
      <CityContextPanel isOpen={cityContextOpen} onClose={() => setCityContextOpen(false)} />
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden lg:block">
          <ThreadsSidebar isOpen={true} onClose={() => {}} />
        </div>
        <ThreadsSidebar isOpen={threadsOpen} onClose={() => setThreadsOpen(false)} />

        <main className="flex-1 flex flex-col min-w-0">
          <ChatPanel />
        </main>
      </div>

      <DiscoverySidebar isOpen={discoveryOpen} onClose={() => setDiscoveryOpen(false)} onSelect={handleDiscoverySelect} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} onSearch={handleSearch} />
      <InstallPrompt />
    </div>
  );
}
