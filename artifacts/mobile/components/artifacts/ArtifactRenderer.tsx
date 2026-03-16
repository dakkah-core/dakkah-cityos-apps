import React from "react";
import { View } from "react-native";
import type { Artifact } from "../../types/chat";
import type { DetailItem } from "../DetailsDrawer";
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
import { FlashSaleCountdown } from "./FlashSaleCountdown";
import { ProductCard } from "./ProductCard";
import { VendorTrustProfile } from "./VendorTrustProfile";
import { InvoicePreview } from "./InvoicePreview";
import { CreditLimitGauge } from "./CreditLimitGauge";
import { EscrowStatus } from "./EscrowStatus";
import { SymptomTriage } from "./SymptomTriage";
import { LessonTracker } from "./LessonTracker";
import { PermitApplication } from "./PermitApplication";
import { IssueReporter } from "./IssueReporter";
import { FlightBoardingPass } from "./FlightBoardingPass";
import { CurrencyConverter } from "./CurrencyConverter";
import { SduiNodeRenderer } from "./SduiNodeRenderer";
import { ToastCard } from "./ToastCard";

interface Props {
  artifacts: Artifact[];
  onAction?: (action: string) => void;
  onShowDetails?: (item: DetailItem) => void;
}

export function ArtifactRenderer({ artifacts, onAction, onShowDetails }: Props) {
  return (
    <View style={{ gap: 8 }}>
      {artifacts.map((artifact, i) => (
        <ArtifactItem key={i} artifact={artifact} onAction={onAction} onShowDetails={onShowDetails} />
      ))}
    </View>
  );
}

function ArtifactItem({ artifact, onAction, onShowDetails }: { artifact: Artifact; onAction?: (action: string) => void; onShowDetails?: (item: DetailItem) => void }) {
  if (!artifact || !artifact.type || artifact.data === undefined || artifact.data === null) {
    return null;
  }
  try {
    return renderArtifact(artifact, onAction, onShowDetails);
  } catch {
    return null;
  }
}

function renderArtifact(artifact: Artifact, onAction?: (action: string) => void, onShowDetails?: (item: DetailItem) => void) {
  switch (artifact.type) {
    case "poi-carousel":
      return <POICarousel data={artifact.data} onAction={onAction} onShowDetails={onShowDetails} />;
    case "event-carousel":
      return <EventCarousel data={artifact.data} onAction={onAction} onShowDetails={onShowDetails} />;
    case "ambassador-carousel":
      return <AmbassadorCarousel data={artifact.data} onAction={onAction} onShowDetails={onShowDetails} />;
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
      return <TicketPass data={artifact.data} onAction={onAction} onShowDetails={onShowDetails} />;
    case "order-tracker":
      return <OrderTracker data={artifact.data} onAction={onAction} onShowDetails={onShowDetails} />;
    case "analytics-snapshot":
      return <AnalyticsSnapshot data={artifact.data} />;
    case "product-carousel":
      return <ProductCarousel data={artifact.data} onAction={onAction} onShowDetails={onShowDetails} />;
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
    case "flash-sale-countdown":
      return <FlashSaleCountdown data={artifact.data} onAction={onAction} />;
    case "product-card":
      return <ProductCard data={artifact.data} onAction={onAction} />;
    case "vendor-trust-profile":
      return <VendorTrustProfile data={artifact.data} onAction={onAction} />;
    case "invoice-preview":
      return <InvoicePreview data={artifact.data} onAction={onAction} />;
    case "credit-limit-gauge":
      return <CreditLimitGauge data={artifact.data} />;
    case "escrow-status":
      return <EscrowStatus data={artifact.data} />;
    case "symptom-triage":
      return <SymptomTriage data={artifact.data} onAction={onAction} />;
    case "lesson-tracker":
      return <LessonTracker data={artifact.data} />;
    case "permit-application":
      return <PermitApplication data={artifact.data} />;
    case "issue-reporter":
      return <IssueReporter data={artifact.data} onAction={onAction} />;
    case "flight-boarding-pass":
      return <FlightBoardingPass data={artifact.data} />;
    case "currency-converter":
      return <CurrencyConverter data={artifact.data} />;
    case "sdui-node":
      return <SduiNodeRenderer data={artifact.data as { node: Record<string, unknown>; theme?: "light" | "dark" }} />;
    case "toast":
      return <ToastCard data={artifact.data as { message: string; type?: "success" | "error" | "warning" | "info"; duration?: number; action?: string; actionLabel?: string }} onAction={onAction} />;
    default:
      return null;
  }
}
