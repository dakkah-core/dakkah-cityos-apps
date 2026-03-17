import { MessageCircle, X } from "lucide-react";

interface FloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function FloatingButton({ isOpen, onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close assistant" : "Open AI assistant"}
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "var(--da-primary)",
        color: "var(--da-primary-fg)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        marginTop: isOpen ? 12 : 0,
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLElement).style.transform = isOpen
          ? "rotate(90deg) scale(1.08)"
          : "scale(1.08)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.transform = isOpen
          ? "rotate(90deg)"
          : "scale(1)";
      }}
    >
      {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </button>
  );
}
