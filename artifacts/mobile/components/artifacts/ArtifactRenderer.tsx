import React from "react";
import { View } from "react-native";
import type { Artifact } from "../../types/chat";
import { POICarousel } from "./POICarousel";
import { EventCarousel } from "./EventCarousel";
import { AmbassadorCarousel } from "./AmbassadorCarousel";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { ConfirmationCard } from "./ConfirmationCard";
import { ComparisonTable } from "./ComparisonTable";
import { ProgressCard } from "./ProgressCard";
import { ZoneHeatmap } from "./ZoneHeatmap";
import { SelectionChips } from "./SelectionChips";
import { TicketPass } from "./TicketPass";
import { OrderTracker } from "./OrderTracker";
import { AnalyticsSnapshot } from "./AnalyticsSnapshot";
import { ProductCarousel } from "./ProductCarousel";
import { ServiceMenu } from "./ServiceMenu";

interface Props {
  artifacts: Artifact[];
  onAction?: (action: string) => void;
}

export function ArtifactRenderer({ artifacts, onAction }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {artifacts.map((artifact, i) => (
        <ArtifactItem key={i} artifact={artifact} onAction={onAction} />
      ))}
    </View>
  );
}

function ArtifactItem({ artifact, onAction }: { artifact: Artifact; onAction?: (action: string) => void }) {
  switch (artifact.type) {
    case "poi-carousel":
      return <POICarousel data={artifact.data} onAction={onAction} />;
    case "event-carousel":
      return <EventCarousel data={artifact.data} onAction={onAction} />;
    case "ambassador-carousel":
      return <AmbassadorCarousel data={artifact.data} onAction={onAction} />;
    case "itinerary-timeline":
      return <ItineraryTimeline data={artifact.data} onAction={onAction} />;
    case "confirmation-card":
      return <ConfirmationCard data={artifact.data} onAction={onAction} />;
    case "comparison-table":
      return <ComparisonTable data={artifact.data} />;
    case "progress-card":
      return <ProgressCard data={artifact.data} />;
    case "zone-heatmap":
      return <ZoneHeatmap data={artifact.data} />;
    case "selection-chips":
      return <SelectionChips data={artifact.data} onAction={onAction} />;
    case "ticket-pass":
      return <TicketPass data={artifact.data} />;
    case "order-tracker":
      return <OrderTracker data={artifact.data} />;
    case "analytics-snapshot":
      return <AnalyticsSnapshot data={artifact.data} />;
    case "product-carousel":
      return <ProductCarousel data={artifact.data} onAction={onAction} />;
    case "service-menu":
      return <ServiceMenu data={artifact.data} onAction={onAction} />;
    default:
      return null;
  }
}
