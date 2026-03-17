import AsyncStorage from "@react-native-async-storage/async-storage";

export async function clearAllData(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const dakkahKeys = keys.filter(
    (k) => k.startsWith("dakkah_"),
  );
  await AsyncStorage.multiRemove(dakkahKeys);
}
