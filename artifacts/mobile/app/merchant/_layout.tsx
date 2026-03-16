import React from "react";
import { Stack } from "expo-router";
import { MerchantProvider } from "@/context/MerchantContext";
import { MerchantRoleGate } from "@/components/merchant/MerchantRoleGate";

export default function MerchantLayout() {
  return (
    <MerchantRoleGate>
      <MerchantProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="catalog" />
          <Stack.Screen name="inventory" />
          <Stack.Screen name="bookings" />
          <Stack.Screen name="analytics" />
          <Stack.Screen name="campaigns" />
        </Stack>
      </MerchantProvider>
    </MerchantRoleGate>
  );
}
