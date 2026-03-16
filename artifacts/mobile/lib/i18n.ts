import { createContext, useContext } from "react";

export type Locale = "en" | "ar";

export interface Translations {
  appName: string;
  appSubtitle: string;
  askAnything: string;
  send: string;
  search: string;
  newConversation: string;
  settings: string;
  darkMode: string;
  language: string;
  notifications: string;
  sounds: string;
  haptics: string;
  privacy: string;
  about: string;
  signOut: string;
  signIn: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  reply: string;
  pin: string;
  unpin: string;
  comingSoon: string;
  gotIt: string;
  voiceCall: string;
  videoCall: string;
  muteNotifications: string;
  unmuteNotifications: string;
  welcome: string;
  popularRequests: string;
  thinking: string;
  replyingTo: string;
  groupInfo: string;
  sharedMedia: string;
  support: string;
  helpSupport: string;
  sendFeedback: string;
  activeQuests: string;
  conversations: string;
  offline: string;
  online: string;
  weather: string;
  todayAgenda: string;
  communityFeed: string;
  quickActions: string;
  general: string;
  version: string;
  explore: string;
  book: string;
  report: string;
  profile: string;
  wallet: string;
  tier: string;
  placesVisited: string;
  favorites: string;
}

const EN: Translations = {
  appName: "Dakkah",
  appSubtitle: "City Experience OS",
  askAnything: "Ask Dakkah anything...",
  send: "Send",
  search: "Search",
  newConversation: "New Conversation",
  settings: "Settings",
  darkMode: "Dark Mode",
  language: "Language",
  notifications: "Notifications",
  sounds: "Sounds",
  haptics: "Haptics",
  privacy: "Privacy",
  about: "About",
  signOut: "Sign Out",
  signIn: "Sign In",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  reply: "Reply",
  pin: "Pin",
  unpin: "Unpin",
  comingSoon: "Coming Soon",
  gotIt: "Got it",
  voiceCall: "Voice Call",
  videoCall: "Video Call",
  muteNotifications: "Mute Notifications",
  unmuteNotifications: "Unmute Notifications",
  welcome: "Hi! I'm your Dakkah Copilot \u2014 your AI concierge for the entire city. I can help you discover experiences, plan trips, join events, manage bookings, and access every capability through conversation.\n\nWhat would you like to do?",
  popularRequests: "Popular requests:",
  thinking: "Copilot is thinking...",
  replyingTo: "Replying to",
  groupInfo: "Group Info",
  sharedMedia: "Shared Media",
  support: "Support",
  helpSupport: "Help & Support",
  sendFeedback: "Send Feedback",
  activeQuests: "Active Quests",
  conversations: "Conversations",
  offline: "Offline",
  online: "Online",
  weather: "Weather",
  todayAgenda: "Today's Agenda",
  communityFeed: "Community Feed",
  quickActions: "Quick Actions",
  general: "General",
  version: "Version",
  explore: "Explore",
  book: "Book",
  report: "Report",
  profile: "Profile",
  wallet: "Wallet",
  tier: "Tier",
  placesVisited: "Places Visited",
  favorites: "Favorites",
};

const AR: Translations = {
  appName: "دكة",
  appSubtitle: "نظام تجربة المدينة",
  askAnything: "اسأل دكة أي شيء...",
  send: "إرسال",
  search: "بحث",
  newConversation: "محادثة جديدة",
  settings: "الإعدادات",
  darkMode: "الوضع الداكن",
  language: "اللغة",
  notifications: "الإشعارات",
  sounds: "الأصوات",
  haptics: "اللمس",
  privacy: "الخصوصية",
  about: "حول",
  signOut: "تسجيل خروج",
  signIn: "تسجيل دخول",
  cancel: "إلغاء",
  save: "حفظ",
  delete: "حذف",
  edit: "تعديل",
  reply: "رد",
  pin: "تثبيت",
  unpin: "إلغاء التثبيت",
  comingSoon: "قريباً",
  gotIt: "فهمت",
  voiceCall: "مكالمة صوتية",
  videoCall: "مكالمة فيديو",
  muteNotifications: "كتم الإشعارات",
  unmuteNotifications: "إلغاء كتم الإشعارات",
  welcome: "مرحباً! أنا مساعد دكة — مرشدك الذكي للمدينة بأكملها. أستطيع مساعدتك في اكتشاف التجارب، تخطيط الرحلات، حضور الفعاليات، إدارة الحجوزات، والوصول لكل الخدمات عبر المحادثة.\n\nماذا تود أن تفعل؟",
  popularRequests: "طلبات شائعة:",
  thinking: "المساعد يفكر...",
  replyingTo: "الرد على",
  groupInfo: "معلومات المجموعة",
  sharedMedia: "الوسائط المشتركة",
  support: "الدعم",
  helpSupport: "المساعدة والدعم",
  sendFeedback: "إرسال ملاحظات",
  activeQuests: "المهام النشطة",
  conversations: "المحادثات",
  offline: "غير متصل",
  online: "متصل",
  weather: "الطقس",
  todayAgenda: "جدول اليوم",
  communityFeed: "أخبار المجتمع",
  quickActions: "إجراءات سريعة",
  general: "عام",
  version: "الإصدار",
  explore: "استكشاف",
  book: "حجز",
  report: "بلاغ",
  profile: "الملف الشخصي",
  wallet: "المحفظة",
  tier: "المستوى",
  placesVisited: "أماكن زُرت",
  favorites: "المفضلة",
};

const TRANSLATIONS: Record<Locale, Translations> = { en: EN, ar: AR };

export function t(locale: Locale, key: keyof Translations): string {
  return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.en[key] || key;
}

export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}
