import { Plus, MessageSquare, X } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ThreadsSidebar({ isOpen, onClose }: Props) {
  const { threads, createNewChat, loadThread } = useChat();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-bold">Conversations</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { createNewChat(); onClose(); }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => { loadThread(thread.id); onClose(); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
            >
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{thread.title}</div>
                <div className="text-xs text-muted-foreground truncate">{thread.lastMessage || "No messages"}</div>
              </div>
              {thread.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <div className="text-[10px] text-muted-foreground text-center">
            Dakkah CityOS v1.0 — PWA Enabled
          </div>
        </div>
      </aside>
    </>
  );
}
