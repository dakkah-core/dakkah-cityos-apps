export { ActiveQuests } from "./components/ActiveQuests";
export { AddMemberDialog } from "./components/AddMemberDialog";
export { ComingSoonModal } from "./components/ComingSoonModal";
export { ContactProfileModal } from "./components/ContactProfileModal";
export { CopilotMessage } from "./components/CopilotMessage";
export { CopilotSettings } from "./components/CopilotSettings";
export { CopilotSettingsDialog } from "./components/CopilotSettingsDialog";
export { DetailsDrawer } from "./components/DetailsDrawer";
export type { DetailItem } from "./components/DetailsDrawer";
export { DiscoverySheet } from "./components/DiscoverySheet";
export { ErrorBoundary } from "./components/ErrorBoundary";
export type { ErrorBoundaryProps } from "./components/ErrorBoundary";
export { ErrorFallback } from "./components/ErrorFallback";
export type { ErrorFallbackProps } from "./components/ErrorFallback";
export { FullSettingsDialog } from "./components/FullSettingsDialog";
export { GroupInfoDialog } from "./components/GroupInfoDialog";
export { MediaPickerButton } from "./components/MediaPickerButton";
export { MentionPopover } from "./components/MentionPopover";
export { MessageContextMenu } from "./components/MessageContextMenu";
export { OfflineIndicator } from "./components/OfflineIndicator";
export { RightDrawer } from "./components/RightDrawer";
export { SearchBar } from "./components/SearchBar";
export { SharedMediaDialog } from "./components/SharedMediaDialog";
export { SlashCommandPalette } from "./components/SlashCommandPalette";
export { SupportDialog } from "./components/SupportDialog";
export { ThreadsDrawer } from "./components/ThreadsDrawer";
export { UserProfile } from "./components/UserProfile";
export { VoiceInputButton } from "./components/VoiceInputButton";

export { ArtifactRenderer } from "./components/artifacts/ArtifactRenderer";
export { AgentSyncCard } from "./components/artifacts/AgentSyncCard";
export { AlertCard } from "./components/artifacts/AlertCard";
export { AmbassadorCarousel } from "./components/artifacts/AmbassadorCarousel";
export { AnalyticsSnapshot } from "./components/artifacts/AnalyticsSnapshot";
export { CalendarSelector } from "./components/artifacts/CalendarSelector";
export { ComparisonTable } from "./components/artifacts/ComparisonTable";
export { ConfirmationCard } from "./components/artifacts/ConfirmationCard";
export { CreditLimitGauge } from "./components/artifacts/CreditLimitGauge";
export { CryptoWallet } from "./components/artifacts/CryptoWallet";
export { CurrencyConverter } from "./components/artifacts/CurrencyConverter";
export { DocumentCard } from "./components/artifacts/DocumentCard";
export { DynamicScreen } from "./components/artifacts/DynamicScreen";
export { EscrowStatus } from "./components/artifacts/EscrowStatus";
export { EventCarousel } from "./components/artifacts/EventCarousel";
export { FlashSaleCountdown } from "./components/artifacts/FlashSaleCountdown";
export { FlightBoardingPass } from "./components/artifacts/FlightBoardingPass";
export { FormGroup } from "./components/artifacts/FormGroup";
export { HealthSnapshot } from "./components/artifacts/HealthSnapshot";
export { InvoicePreview } from "./components/artifacts/InvoicePreview";
export { IssueReporter } from "./components/artifacts/IssueReporter";
export { ItineraryTimeline } from "./components/artifacts/ItineraryTimeline";
export { LessonTracker } from "./components/artifacts/LessonTracker";
export { MapView } from "./components/artifacts/MapView";
export { MediaPlayer } from "./components/artifacts/MediaPlayer";
export { OrderTracker } from "./components/artifacts/OrderTracker";
export { ParcelLocker } from "./components/artifacts/ParcelLocker";
export { ParkingMeter } from "./components/artifacts/ParkingMeter";
export { PaymentRequest } from "./components/artifacts/PaymentRequest";
export { PermitApplication } from "./components/artifacts/PermitApplication";
export { POICarousel } from "./components/artifacts/POICarousel";
export { PollCard } from "./components/artifacts/PollCard";
export { ProductCard } from "./components/artifacts/ProductCard";
export { ProductCarousel } from "./components/artifacts/ProductCarousel";
export { ProfileCard } from "./components/artifacts/ProfileCard";
export { ProgressCard } from "./components/artifacts/ProgressCard";
export { ReceiptCard } from "./components/artifacts/ReceiptCard";
export { ReservationCard } from "./components/artifacts/ReservationCard";
export { RideStatus } from "./components/artifacts/RideStatus";
export { SduiNodeRenderer } from "./components/artifacts/SduiNodeRenderer";
export { SelectionChips } from "./components/artifacts/SelectionChips";
export { ServiceMenu } from "./components/artifacts/ServiceMenu";
export { SmartHomeControl } from "./components/artifacts/SmartHomeControl";
export { SymptomTriage } from "./components/artifacts/SymptomTriage";
export { TaskChecklist } from "./components/artifacts/TaskChecklist";
export { TicketPass } from "./components/artifacts/TicketPass";
export { ToastCard } from "./components/artifacts/ToastCard";
export { VendorTrustProfile } from "./components/artifacts/VendorTrustProfile";
export { VoiceNote } from "./components/artifacts/VoiceNote";
export { WeatherCard } from "./components/artifacts/WeatherCard";
export { ZoneHeatmap } from "./components/artifacts/ZoneHeatmap";

export { AuthProvider, useAuth } from "./context/AuthContext";
export type { UserProfile as UserProfileData } from "./context/AuthContext";
export { ChatProvider, useCopilot } from "./context/ChatContext";
export { ThemeProvider, useTheme } from "./context/ThemeContext";
export type { ThemeMode, ColorPalette } from "./context/ThemeContext";

export {
  aiChat,
  aiExecute,
  fetchSduiScreen,
  transcribeAudio,
  fetchThreads,
  fetchThread,
  syncThread,
  deleteServerThread,
  fetchProducts,
  addToCart,
  getCart,
  validateAddress,
  getDeliveryOptions,
  createPaymentSession,
  checkout,
} from "./lib/ai-client";

export { CONTACTS, SLASH_COMMANDS, REACTION_EMOJIS } from "./lib/contacts";
export { processUserMessage } from "./lib/copilot-brain";
export { CATEGORIES, QUICK_ACTIONS } from "./lib/discovery-data";
export type { ActionCategory, QuickAction } from "./lib/discovery-data";
export { apiClient, callGateway, getHealthDashboard } from "./lib/gateway";
export { t, isRTL } from "./lib/i18n";
export type { Locale, Translations } from "./lib/i18n";
export { generateId } from "./lib/id";
export { registerForPushNotifications, unregisterPushNotifications, updateNotificationCategories, getPushToken } from "./lib/notifications";
export type { NotificationCategory } from "./lib/notifications";
export { clearAllData } from "./lib/storage";

export { COLORS, BRAND } from "./constants/colors";

export type {
  MessageReaction,
  MessageAttachment,
  Message,
  ArtifactType,
  Artifact,
  POI,
  CityEvent,
  Ambassador,
  ItineraryDay,
  ItineraryItem,
  ZoneData,
  ProgressData,
  ComparisonItem,
  TicketData,
  OrderData,
  AnalyticsMetric,
  Product,
  ServiceItem,
  ChatThread,
} from "./types/chat";

export type { Contact } from "./types/chat";
