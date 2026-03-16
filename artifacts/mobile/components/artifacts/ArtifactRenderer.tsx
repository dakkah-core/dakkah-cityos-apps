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
import { AgentSyncCard } from "./AgentSyncCard";
import { CalendarSelector } from "./CalendarSelector";
import { FormGroup } from "./FormGroup";
import { MapView } from "./MapView";
import { MediaPlayer } from "./MediaPlayer";
import { PaymentRequest } from "./PaymentRequest";
import { RideStatus } from "./RideStatus";
import { WeatherCard } from "./WeatherCard";
import { PollCard } from "./PollCard";
import { AlertCard } from "./AlertCard";
import { DocumentCard } from "./DocumentCard";
import { ReceiptCard } from "./ReceiptCard";
import { HealthSnapshot } from "./HealthSnapshot";
import { SmartHomeControl } from "./SmartHomeControl";
import { ParkingMeter } from "./ParkingMeter";
import { ParcelLocker } from "./ParcelLocker";
import { ReservationCard } from "./ReservationCard";
import { CryptoWallet } from "./CryptoWallet";
import { TaskChecklist } from "./TaskChecklist";
import { VoiceNote } from "./VoiceNote";
import { ProfileCard } from "./ProfileCard";

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
    case "agent-sync-card":
      return <AgentSyncCard data={artifact.data} onAction={onAction} />;
    case "calendar-selector":
      return <CalendarSelector data={artifact.data} onAction={onAction} />;
    case "form-group":
      return <FormGroup data={artifact.data} onAction={onAction} />;
    case "map-view":
      return <MapView data={artifact.data} onAction={onAction} />;
    case "media-player":
      return <MediaPlayer data={artifact.data} onAction={onAction} />;
    case "payment-request":
      return <PaymentRequest data={artifact.data} onAction={onAction} />;
    case "ride-status":
      return <RideStatus data={artifact.data} onAction={onAction} />;
    case "weather-card":
      return <WeatherCard data={artifact.data} />;
    case "poll-card":
      return <PollCard data={artifact.data} onAction={onAction} />;
    case "alert-card":
      return <AlertCard data={artifact.data} onAction={onAction} />;
    case "document-card":
      return <DocumentCard data={artifact.data} onAction={onAction} />;
    case "receipt-card":
      return <ReceiptCard data={artifact.data} />;
    case "health-snapshot":
      return <HealthSnapshot data={artifact.data} />;
    case "smart-home-control":
      return <SmartHomeControl data={artifact.data} onAction={onAction} />;
    case "parking-meter":
      return <ParkingMeter data={artifact.data} onAction={onAction} />;
    case "parcel-locker":
      return <ParcelLocker data={artifact.data} onAction={onAction} />;
    case "reservation-card":
      return <ReservationCard data={artifact.data} onAction={onAction} />;
    case "crypto-wallet":
      return <CryptoWallet data={artifact.data} onAction={onAction} />;
    case "task-checklist":
      return <TaskChecklist data={artifact.data} onAction={onAction} />;
    case "voice-note":
      return <VoiceNote data={artifact.data} onAction={onAction} />;
    case "profile-card":
      return <ProfileCard data={artifact.data} onAction={onAction} />;
    default:
      return null;
  }
}
