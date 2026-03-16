import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useChat } from "@/context/ChatContext";
import Avatar from "@/components/Avatar";
import { contacts } from "@/lib/seed-data";
import type { Contact } from "@/types/chat";

export default function NewChatScreen() {
  const insets = useSafeAreaInsets();
  const { createConversation } = useChat();
  const [search, setSearch] = useState("");

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectContact = useCallback(
    (contact: Contact) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const conv = createConversation(contact.id);
      router.dismiss();
      setTimeout(() => {
        router.push({ pathname: "/chat/[id]", params: { id: conv.id } });
      }, 100);
    },
    [createConversation],
  );

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.dismiss();
  }, []);

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <Pressable
        style={({ pressed }) => [
          styles.contactItem,
          pressed && styles.contactItemPressed,
        ]}
        onPress={() => handleSelectContact(item)}
      >
        <Avatar name={item.name} size={48} isOnline={item.isOnline} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactRole}>
            {item.role}
            {item.department ? ` \u00B7 ${item.department}` : ""}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.light.textMuted}
        />
      </Pressable>
    ),
    [handleSelectContact],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + webTopInset + 8 },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>New Message</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={handleClose}
          >
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color={Colors.light.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={Colors.light.textMuted}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.light.textMuted}
              />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingBottom: insets.bottom + webBottomInset + 20,
        }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View style={styles.separatorWrapper}>
            <View style={styles.separator} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={48}
              color={Colors.light.textMuted}
            />
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.inputBg,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  contactItemPressed: {
    backgroundColor: Colors.light.borderLight,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  contactRole: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  separatorWrapper: {
    paddingLeft: 80,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.border,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textMuted,
  },
});
