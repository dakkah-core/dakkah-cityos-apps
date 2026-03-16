import React from "react";
import { Stack } from "expo-router";
import { PosProvider } from "@/context/PosContext";
import { PosRoleGate } from "@/components/pos/PosRoleGate";

export default function PosLayout() {
  return (
    <PosRoleGate>
      <PosProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="scanner" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="receipt" />
          <Stack.Screen name="kitchen" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="returns" />
        </Stack>
      </PosProvider>
    </PosRoleGate>
  );
}
