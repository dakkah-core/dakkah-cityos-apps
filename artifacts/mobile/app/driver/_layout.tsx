import React from "react";
import { Stack } from "expo-router";
import { DriverProvider } from "@/context/DriverContext";

export default function DriverLayout() {
  return (
    <DriverProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="job" />
        <Stack.Screen name="earnings" />
        <Stack.Screen name="inspection" />
      </Stack>
    </DriverProvider>
  );
}
