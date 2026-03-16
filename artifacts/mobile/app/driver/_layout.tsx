import React from "react";
import { Stack } from "expo-router";
import { DriverProvider } from "@/context/DriverContext";
import { DriverRoleGate } from "@/components/driver/DriverRoleGate";

export default function DriverLayout() {
  return (
    <DriverRoleGate>
      <DriverProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="job" />
          <Stack.Screen name="earnings" />
          <Stack.Screen name="inspection" />
        </Stack>
      </DriverProvider>
    </DriverRoleGate>
  );
}
