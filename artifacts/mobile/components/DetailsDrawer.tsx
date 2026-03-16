import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import type { POI, CityEvent, Ambassador, OrderData, TicketData, Product } from "../types/chat";

export type DetailItem =
  | { type: "poi"; data: POI }
  | { type: "ticket"; data: TicketData }
  | { type: "event"; data: CityEvent }
  | { type: "friend"; data: Ambassador }
  | { type: "order"; data: OrderData }
  | { type: "product"; data: Product };

interface Props {
  visible: boolean;
  item: DetailItem | null;
  onClose: () => void;
  onAction: (message: string) => void;
}

export function DetailsDrawer({ visible, item, onClose, onAction }: Props) {
  const insets = useSafeAreaInsets();

  if (!item) return null;

  const handleAction = (msg: string) => {
    onAction(msg);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Details</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {item.type === "poi" && <POIDetail data={item.data} onAction={handleAction} />}
            {item.type === "ticket" && <TicketDetail data={item.data} />}
            {item.type === "event" && <EventDetail data={item.data} onAction={handleAction} />}
            {item.type === "friend" && <FriendDetail data={item.data} onAction={handleAction} />}
            {item.type === "order" && <OrderDetail data={item.data} onAction={handleAction} />}
            {item.type === "product" && <ProductDetail data={item.data} onAction={handleAction} />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function POIDetail({ data, onAction }: { data: POI; onAction: (msg: string) => void }) {
  return (
    <View>
      <Image source={{ uri: data.image }} style={styles.heroImage} />
      <View style={styles.detailBody}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailName}>{data.name}</Text>
            <Text style={styles.detailCategory}>{data.category}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {data.rating}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>{data.distance}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>{data.priceRange}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.metaItem, { color: data.openNow ? COLORS.success : COLORS.danger }]}>
            {data.openNow ? "Open Now" : "Closed"}
          </Text>
        </View>

        {Array.isArray(data.vibe) && data.vibe.length > 0 && (
          <View style={styles.vibes}>
            {data.vibe.map((v) => (
              <View key={v} style={styles.vibePill}>
                <Text style={styles.vibeText}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <ActionButton icon="📍" label="Navigate" onPress={() => onAction(`Navigate to ${data.name}`)} />
          <ActionButton icon="📞" label="Call" onPress={() => onAction(`Call ${data.name}`)} />
          <ActionButton icon="📅" label="Book" onPress={() => onAction(`Book a table at ${data.name}`)} />
          <ActionButton icon="📤" label="Share" onPress={() => onAction(`Share ${data.name} with a friend`)} />
        </View>
      </View>
    </View>
  );
}

function TicketDetail({ data }: { data: TicketData }) {
  return (
    <View style={styles.ticketContainer}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketEventName}>{data.eventName}</Text>
        <View style={styles.ticketSeatBadge}>
          <Text style={styles.ticketSeatText}>{data.seat}</Text>
        </View>
      </View>

      <View style={styles.ticketDivider}>
        <View style={styles.ticketNotchL} />
        <View style={styles.ticketDash} />
        <View style={styles.ticketNotchR} />
      </View>

      <View style={styles.ticketDetails}>
        <TicketRow label="Date" value={data.date} />
        <TicketRow label="Time" value={data.time} />
        <TicketRow label="Location" value={data.location} />
        <TicketRow label="Ticket ID" value={data.id} />
      </View>

      <View style={styles.ticketQR}>
        <View style={styles.qrBox}>
          <Text style={styles.qrIcon}>▣</Text>
        </View>
        <Text style={styles.qrLabel}>Scan at entrance</Text>
      </View>
    </View>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.ticketRow}>
      <Text style={styles.ticketLabel}>{label}</Text>
      <Text style={styles.ticketValue}>{value}</Text>
    </View>
  );
}

function EventDetail({ data, onAction }: { data: CityEvent; onAction: (msg: string) => void }) {
  return (
    <View>
      <Image source={{ uri: data.image }} style={styles.heroImage} />
      <View style={styles.detailBody}>
        <View style={styles.eventCatRow}>
          <View style={styles.eventCatPill}>
            <Text style={styles.eventCatText}>{data.category}</Text>
          </View>
          <Text style={styles.eventPrice}>{data.price}</Text>
        </View>
        <Text style={styles.detailName}>{data.name}</Text>

        <View style={styles.eventInfoList}>
          <EventInfoRow icon="📅" text={data.date} />
          <EventInfoRow icon="🕐" text={data.time} />
          <EventInfoRow icon="📍" text={data.location} />
          <EventInfoRow icon="👥" text={`${data.attendees} attending`} />
        </View>

        <View style={styles.actionRow}>
          <ActionButton icon="🎟️" label="Get Tickets" onPress={() => onAction(`Get tickets for ${data.name}`)} primary />
          <ActionButton icon="📤" label="Share" onPress={() => onAction(`Share ${data.name}`)} />
          <ActionButton icon="🔔" label="Remind" onPress={() => onAction(`Remind me about ${data.name}`)} />
        </View>
      </View>
    </View>
  );
}

function EventInfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.eventInfoRow}>
      <Text style={styles.eventInfoIcon}>{icon}</Text>
      <Text style={styles.eventInfoText}>{text}</Text>
    </View>
  );
}

function FriendDetail({ data, onAction }: { data: Ambassador; onAction: (msg: string) => void }) {
  return (
    <View style={styles.detailBody}>
      <View style={styles.friendHeader}>
        <Image source={{ uri: data.avatar }} style={styles.friendAvatar} />
        {data.verified && (
          <View style={styles.friendVerified}>
            <Text style={styles.friendVerifiedText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.friendName}>{data.name}</Text>
      <Text style={styles.friendSpecialty}>{data.specialty}</Text>

      <View style={styles.friendScoreRow}>
        <Text style={styles.friendScoreLabel}>Fit Score</Text>
        <View style={styles.friendScoreBg}>
          <View style={[styles.friendScoreFill, { width: `${data.fitScore}%` }]} />
        </View>
        <Text style={styles.friendScoreVal}>{data.fitScore}%</Text>
      </View>

      <Text style={styles.friendReviews}>{data.reviews} reviews</Text>

      <View style={styles.actionRow}>
        <ActionButton icon="💬" label="Message" onPress={() => onAction(`Message ${data.name}`)} primary />
        <ActionButton icon="📞" label="Call" onPress={() => onAction(`Call ${data.name}`)} />
        <ActionButton icon="📤" label="Share" onPress={() => onAction(`Share ${data.name}'s profile`)} />
      </View>
    </View>
  );
}

function OrderDetail({ data, onAction }: { data: OrderData; onAction: (msg: string) => void }) {
  const STEPS = ["confirmed", "preparing", "on-the-way", "delivered"] as const;
  const STEP_LABELS = ["Confirmed", "Preparing", "On the Way", "Delivered"];
  const currentIndex = STEPS.indexOf(data.status);

  return (
    <View style={styles.detailBody}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNum}>Order #{data.orderNumber}</Text>
        <Text style={styles.orderEta}>ETA: {data.estimatedTime}</Text>
      </View>

      <View style={styles.orderStepper}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.orderStepItem}>
            <View style={[
              styles.orderStepDot,
              i <= currentIndex && styles.orderStepDotActive,
              i === currentIndex && styles.orderStepDotCurrent,
            ]} />
            {i < STEPS.length - 1 && (
              <View style={[styles.orderStepLine, i < currentIndex && styles.orderStepLineActive]} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.orderStepLabels}>
        {STEP_LABELS.map((label, i) => (
          <Text key={label} style={[styles.orderStepLabel, i <= currentIndex && styles.orderStepLabelActive]}>
            {label}
          </Text>
        ))}
      </View>

      {Array.isArray(data.items) && data.items.length > 0 && (
        <View style={styles.orderItems}>
          <Text style={styles.orderItemsTitle}>Items</Text>
          {data.items.map((item, i) => (
            <Text key={i} style={styles.orderItemText}>• {item}</Text>
          ))}
        </View>
      )}

      <View style={styles.orderTotalRow}>
        <Text style={styles.orderTotalLabel}>Total</Text>
        <Text style={styles.orderTotalValue}>{data.total}</Text>
      </View>

      <View style={styles.actionRow}>
        <ActionButton icon="📍" label="Track" onPress={() => onAction(`Track order ${data.orderNumber}`)} primary />
        <ActionButton icon="📞" label="Contact" onPress={() => onAction(`Contact driver for order ${data.orderNumber}`)} />
      </View>
    </View>
  );
}

function ProductDetail({ data, onAction }: { data: Product; onAction: (msg: string) => void }) {
  return (
    <View>
      <Image source={{ uri: data.image }} style={styles.heroImage} />
      <View style={styles.detailBody}>
        <Text style={styles.productBrand}>{data.brand}</Text>
        <Text style={styles.detailName}>{data.name}</Text>
        <Text style={styles.productPrice}>{data.price}</Text>

        {Array.isArray(data.tags) && data.tags.length > 0 && (
          <View style={styles.vibes}>
            {data.tags.map((t) => (
              <View key={t} style={styles.vibePill}>
                <Text style={styles.vibeText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <ActionButton icon="🛒" label="Add to Cart" onPress={() => onAction(`Add ${data.name} to cart`)} primary />
          <ActionButton icon="❤️" label="Save" onPress={() => onAction(`Save ${data.name} to wishlist`)} />
          <ActionButton icon="📤" label="Share" onPress={() => onAction(`Share ${data.name}`)} />
        </View>
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress, primary }: { icon: string; label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable
      style={[styles.actionBtn, primary && styles.actionBtnPrimary]}
      onPress={onPress}
    >
      <Text style={styles.actionBtnIcon}>{icon}</Text>
      <Text style={[styles.actionBtnLabel, primary && styles.actionBtnLabelPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", paddingTop: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  close: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  scrollContent: { paddingBottom: 24 },

  heroImage: { width: "100%", height: 200, backgroundColor: COLORS.borderLight },
  detailBody: { padding: 20 },
  detailName: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  detailCategory: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },

  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  ratingBadge: { backgroundColor: COLORS.warning, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  ratingText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  metaItem: { fontSize: 13, color: COLORS.textSecondary },
  metaDot: { fontSize: 10, color: COLORS.textMuted },

  vibes: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  vibePill: { backgroundColor: COLORS.primaryTint, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  vibeText: { fontSize: 11, color: COLORS.primary, fontWeight: "600" },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  actionBtnPrimary: { backgroundColor: COLORS.darkNavy, borderColor: COLORS.darkNavy },
  actionBtnIcon: { fontSize: 18, marginBottom: 4 },
  actionBtnLabel: { fontSize: 11, fontWeight: "600", color: COLORS.textSecondary },
  actionBtnLabelPrimary: { color: "#fff" },

  ticketContainer: { backgroundColor: COLORS.darkNavy, borderRadius: 20, overflow: "hidden", marginHorizontal: 20 },
  ticketHeader: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  ticketEventName: { fontSize: 22, fontWeight: "800", color: "#fff", flex: 1, marginRight: 12 },
  ticketSeatBadge: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  ticketSeatText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  ticketDivider: { flexDirection: "row", alignItems: "center" },
  ticketNotchL: { width: 16, height: 32, borderTopRightRadius: 16, borderBottomRightRadius: 16, backgroundColor: "#fff" },
  ticketDash: { flex: 1, height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  ticketNotchR: { width: 16, height: 32, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, backgroundColor: "#fff" },
  ticketDetails: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  ticketRow: { flexDirection: "row", justifyContent: "space-between" },
  ticketLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  ticketValue: { fontSize: 13, fontWeight: "600", color: "#fff" },
  ticketQR: { alignItems: "center", padding: 20, backgroundColor: "rgba(255,255,255,0.05)", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  qrBox: { width: 80, height: 80, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  qrIcon: { fontSize: 40, color: "#fff" },
  qrLabel: { fontSize: 11, color: "rgba(255,255,255,0.4)" },

  eventCatRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  eventCatPill: { backgroundColor: COLORS.primaryTint, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  eventCatText: { fontSize: 11, color: COLORS.primary, fontWeight: "600" },
  eventPrice: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  eventInfoList: { gap: 8, marginTop: 12 },
  eventInfoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  eventInfoIcon: { fontSize: 16 },
  eventInfoText: { fontSize: 14, color: COLORS.textSecondary },

  friendHeader: { alignItems: "center", marginBottom: 12, position: "relative" },
  friendAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.borderLight },
  friendVerified: { position: "absolute", bottom: 0, right: "35%", width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  friendVerifiedText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  friendName: { fontSize: 20, fontWeight: "800", color: COLORS.text, textAlign: "center" },
  friendSpecialty: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", marginTop: 4 },
  friendScoreRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  friendScoreLabel: { fontSize: 12, color: COLORS.textMuted, width: 65 },
  friendScoreBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: COLORS.borderLight, overflow: "hidden" },
  friendScoreFill: { height: "100%", borderRadius: 3, backgroundColor: COLORS.primary },
  friendScoreVal: { fontSize: 13, fontWeight: "700", color: COLORS.primary, width: 40, textAlign: "right" },
  friendReviews: { fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 8 },

  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  orderNum: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  orderEta: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  orderStepper: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  orderStepItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  orderStepDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.borderLight, borderWidth: 2, borderColor: COLORS.border },
  orderStepDotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  orderStepDotCurrent: { borderColor: COLORS.primary, backgroundColor: "#fff", borderWidth: 3 },
  orderStepLine: { flex: 1, height: 2, backgroundColor: COLORS.border },
  orderStepLineActive: { backgroundColor: COLORS.primary },
  orderStepLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  orderStepLabel: { fontSize: 10, color: COLORS.textMuted, textAlign: "center" },
  orderStepLabelActive: { color: COLORS.primary, fontWeight: "600" },
  orderItems: { marginBottom: 12 },
  orderItemsTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  orderItemText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 22 },
  orderTotalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  orderTotalLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  orderTotalValue: { fontSize: 16, fontWeight: "800", color: COLORS.primary },

  productBrand: { fontSize: 11, fontWeight: "600", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  productPrice: { fontSize: 22, fontWeight: "800", color: COLORS.primary, marginTop: 6, marginBottom: 12 },
});
