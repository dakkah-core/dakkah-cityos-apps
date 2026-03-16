import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "./AuthContext";
import type { DriverJob, DriverStatus, DriverEarnings, OfflineAction, InspectionCheck, InspectionResult, SOSReport } from "@/types/driver";
import {
  getDriverStatus,
  setDriverStatus as apiSetStatus,
  getDriverJobs,
  acceptJob as apiAcceptJob,
  rejectJob as apiRejectJob,
  confirmPickup as apiConfirmPickup,
  markArrived as apiMarkArrived,
  completeDelivery as apiCompleteDelivery,
  reportPosition,
  getEarnings as apiGetEarnings,
  submitInspection as apiSubmitInspection,
  sendSOS as apiSendSOS,
  syncOfflineActions,
} from "@/lib/driver-api";
import { generateId } from "@/lib/id";

const OFFLINE_QUEUE_KEY = "dakkah_driver_offline_queue";
const CACHED_JOBS_KEY = "dakkah_driver_cached_jobs";

interface DriverContextValue {
  status: DriverStatus;
  jobs: DriverJob[];
  activeJob: DriverJob | null;
  completedToday: number;
  isLoading: boolean;
  isOnline: boolean;
  offlineQueueCount: number;
  setStatus: (status: DriverStatus) => Promise<void>;
  refreshJobs: () => Promise<void>;
  acceptJob: (jobId: string) => Promise<boolean>;
  rejectJob: (jobId: string) => Promise<boolean>;
  pickupJob: (jobId: string, scannedBarcodes: string[]) => Promise<boolean>;
  arriveAtCustomer: (jobId: string) => Promise<boolean>;
  completeJob: (jobId: string, proof: { proofType: "signature" | "photo" | "both"; signatureData?: string; photoUri?: string; recipientName?: string }) => Promise<boolean>;
  getEarnings: (period: "today" | "week" | "month") => Promise<DriverEarnings | null>;
  submitInspection: (vehicleId: string, checks: InspectionCheck[]) => Promise<InspectionResult | null>;
  triggerSOS: (report: SOSReport) => Promise<{ sosId: string; estimatedResponse: string } | null>;
}

const DriverContext = createContext<DriverContextValue>({
  status: "offline",
  jobs: [],
  activeJob: null,
  completedToday: 0,
  isLoading: true,
  isOnline: true,
  offlineQueueCount: 0,
  setStatus: async () => {},
  refreshJobs: async () => {},
  acceptJob: async () => false,
  rejectJob: async () => false,
  pickupJob: async () => false,
  arriveAtCustomer: async () => false,
  completeJob: async () => false,
  getEarnings: async () => null,
  submitInspection: async () => null,
  triggerSOS: async () => null,
});

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = useAuth();
  const [status, setStatusState] = useState<DriverStatus>("offline");
  const [jobs, setJobs] = useState<DriverJob[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeJob = jobs.find((j) =>
    j.status === "accepted" || j.status === "in_transit" || j.status === "arrived"
  ) || null;

  const enqueueOffline = useCallback(async (action: string, payload: Record<string, unknown>) => {
    const item: OfflineAction = { id: generateId("ofl"), action, payload, timestamp: Date.now() };
    setOfflineQueue((prev) => {
      const updated = [...prev, item];
      AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const trySyncQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;
    const token = await getAccessToken();
    const success = await syncOfflineActions(offlineQueue, token || undefined);
    if (success) {
      setOfflineQueue([]);
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY).catch(() => {});
    }
  }, [offlineQueue, getAccessToken]);

  useEffect(() => {
    (async () => {
      try {
        const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        if (queueData) setOfflineQueue(JSON.parse(queueData));

        const cachedJobs = await AsyncStorage.getItem(CACHED_JOBS_KEY);
        if (cachedJobs) setJobs(JSON.parse(cachedJobs));

        const token = await getAccessToken();
        const data = await getDriverStatus(token || undefined);
        if (data) {
          setStatusState(data.status);
          setJobs(data.activeJobs);
          setCompletedToday(data.completedToday);
          await AsyncStorage.setItem(CACHED_JOBS_KEY, JSON.stringify(data.activeJobs)).catch(() => {});
        }
      } catch {
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [getAccessToken]);

  useEffect(() => {
    if (status === "online") {
      positionIntervalRef.current = setInterval(async () => {
        const token = await getAccessToken();
        await reportPosition(
          { lat: 24.7136 + Math.random() * 0.01, lng: 46.6753 + Math.random() * 0.01, heading: Math.random() * 360, speed: 20 + Math.random() * 40 },
          token || undefined
        );
      }, 15000);
    } else {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
    }

    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
    };
  }, [status, getAccessToken]);

  useEffect(() => {
    if (isOnline) trySyncQueue();
  }, [isOnline, trySyncQueue]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsOnline(connected);
      if (connected && offlineQueue.length > 0) {
        trySyncQueue();
      }
    });
    return () => unsubscribe();
  }, [offlineQueue.length, trySyncQueue]);

  const setStatus = useCallback(async (newStatus: DriverStatus) => {
    const token = await getAccessToken();
    const result = await apiSetStatus(newStatus, token || undefined);
    if (result) {
      setStatusState(result.status);
      if (newStatus === "online") {
        const jobsData = await getDriverJobs(undefined, token || undefined);
        setJobs(jobsData);
        await AsyncStorage.setItem(CACHED_JOBS_KEY, JSON.stringify(jobsData)).catch(() => {});
      }
    } else {
      setStatusState(newStatus);
      await enqueueOffline("setStatus", { status: newStatus });
    }
  }, [getAccessToken, enqueueOffline]);

  const refreshJobs = useCallback(async () => {
    const token = await getAccessToken();
    const jobsData = await getDriverJobs(undefined, token || undefined);
    setJobs(jobsData);
    await AsyncStorage.setItem(CACHED_JOBS_KEY, JSON.stringify(jobsData)).catch(() => {});
  }, [getAccessToken]);

  const acceptJobFn = useCallback(async (jobId: string) => {
    const token = await getAccessToken();
    const job = await apiAcceptJob(jobId, token || undefined);
    if (job) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? job : j)));
      return true;
    }
    await enqueueOffline("acceptJob", { jobId });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "accepted" as const } : j)));
    return true;
  }, [getAccessToken, enqueueOffline]);

  const rejectJobFn = useCallback(async (jobId: string) => {
    const token = await getAccessToken();
    const success = await apiRejectJob(jobId, token || undefined);
    if (success) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "cancelled" as const } : j)));
      return true;
    }
    await enqueueOffline("rejectJob", { jobId });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "cancelled" as const } : j)));
    return true;
  }, [getAccessToken, enqueueOffline]);

  const pickupJob = useCallback(async (jobId: string, scannedBarcodes: string[]) => {
    const token = await getAccessToken();
    const result = await apiConfirmPickup(jobId, scannedBarcodes, token || undefined);
    if (result) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? result.job : j)));
      return true;
    }
    await enqueueOffline("pickup", { jobId, scannedBarcodes });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "in_transit" as const } : j)));
    return true;
  }, [getAccessToken, enqueueOffline]);

  const arriveAtCustomer = useCallback(async (jobId: string) => {
    const token = await getAccessToken();
    const job = await apiMarkArrived(jobId, token || undefined);
    if (job) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? job : j)));
      return true;
    }
    await enqueueOffline("arrive", { jobId });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "arrived" as const } : j)));
    return true;
  }, [getAccessToken, enqueueOffline]);

  const completeJob = useCallback(async (jobId: string, proof: { proofType: "signature" | "photo" | "both"; signatureData?: string; photoUri?: string; recipientName?: string }) => {
    const token = await getAccessToken();
    const result = await apiCompleteDelivery(jobId, proof, token || undefined);
    if (result) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? result.job : j)));
      setCompletedToday((prev) => prev + 1);
      return true;
    }
    await enqueueOffline("complete", { jobId, ...proof });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "completed" as const } : j)));
    setCompletedToday((prev) => prev + 1);
    return true;
  }, [getAccessToken, enqueueOffline]);

  const getEarningsFn = useCallback(async (period: "today" | "week" | "month") => {
    const token = await getAccessToken();
    return apiGetEarnings(period, token || undefined);
  }, [getAccessToken]);

  const submitInspectionFn = useCallback(async (vehicleId: string, checks: InspectionCheck[]) => {
    const token = await getAccessToken();
    return apiSubmitInspection(vehicleId, checks, token || undefined);
  }, [getAccessToken]);

  const triggerSOS = useCallback(async (report: SOSReport) => {
    const token = await getAccessToken();
    const result = await apiSendSOS(report, token || undefined);
    if (result) return { sosId: result.sosId, estimatedResponse: result.estimatedResponse };
    await enqueueOffline("sos", report as unknown as Record<string, unknown>);
    return { sosId: "sos_offline", estimatedResponse: "Queued — will send when online" };
  }, [getAccessToken, enqueueOffline]);

  return (
    <DriverContext.Provider value={{
      status,
      jobs,
      activeJob,
      completedToday,
      isLoading,
      isOnline,
      offlineQueueCount: offlineQueue.length,
      setStatus,
      refreshJobs,
      acceptJob: acceptJobFn,
      rejectJob: rejectJobFn,
      pickupJob,
      arriveAtCustomer,
      completeJob: completeJob,
      getEarnings: getEarningsFn,
      submitInspection: submitInspectionFn,
      triggerSOS,
    }}>
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  return useContext(DriverContext);
}
