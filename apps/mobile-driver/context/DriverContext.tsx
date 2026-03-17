import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as Notifications from "expo-notifications";
import { useAuth, generateId } from "@cityos/mobile-core";
import type {
  DriverJob, DriverStatus, DriverEarnings, OfflineAction,
  InspectionCheck, InspectionResult, SOSReport, DriverProfile,
  ShiftSummary, InspectionHistoryEntry, Vehicle, JobOffer,
} from "@/types/driver";
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
  getDriverProfile as apiGetProfile,
  getVehicles as apiGetVehicles,
  getInspectionHistory as apiGetInspectionHistory,
  getShiftHistory as apiGetShiftHistory,
} from "@/lib/driver-api";

const OFFLINE_QUEUE_KEY = "dakkah_driver_offline_queue";
const CACHED_JOBS_KEY = "dakkah_driver_cached_jobs";

interface DriverContextValue {
  status: DriverStatus;
  jobs: DriverJob[];
  activeJob: DriverJob | null;
  completedToday: number;
  todayEarnings: number;
  todayTips: number;
  currency: string;
  isLoading: boolean;
  isOnline: boolean;
  offlineQueueCount: number;
  profile: DriverProfile | null;
  jobOffer: JobOffer | null;
  notificationCount: number;
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
  getProfile: () => Promise<DriverProfile | null>;
  getVehicles: () => Promise<Vehicle[]>;
  getInspectionHistory: () => Promise<InspectionHistoryEntry[]>;
  getShiftHistory: () => Promise<ShiftSummary[]>;
  dismissJobOffer: () => void;
  acceptJobOffer: () => Promise<boolean>;
  clearNotifications: () => void;
  updatePreferences: (prefs: Partial<DriverProfile["preferences"]>) => void;
}

const DriverContext = createContext<DriverContextValue>({
  status: "offline",
  jobs: [],
  activeJob: null,
  completedToday: 0,
  todayEarnings: 0,
  todayTips: 0,
  currency: "SAR",
  isLoading: true,
  isOnline: true,
  offlineQueueCount: 0,
  profile: null,
  jobOffer: null,
  notificationCount: 0,
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
  getProfile: async () => null,
  getVehicles: async () => [],
  getInspectionHistory: async () => [],
  getShiftHistory: async () => [],
  dismissJobOffer: () => {},
  acceptJobOffer: async () => false,
  clearNotifications: () => {},
  updatePreferences: () => {},
});

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = useAuth();
  const [status, setStatusState] = useState<DriverStatus>("offline");
  const [jobs, setJobs] = useState<DriverJob[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayTips, setTodayTips] = useState(0);
  const [currency, setCurrency] = useState("SAR");
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [notificationCount, setNotificationCount] = useState(2);
  const positionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jobOfferTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          setTodayEarnings(data.todayEarnings ?? 0);
          setTodayTips(data.todayTips ?? 0);
          setCurrency(data.currency ?? "SAR");
          await AsyncStorage.setItem(CACHED_JOBS_KEY, JSON.stringify(data.activeJobs)).catch(() => {});
        }

        const profileData = await apiGetProfile(token || undefined);
        if (profileData) setProfile(profileData);
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

      const offerDelay = 8000 + Math.random() * 12000;
      jobOfferTimerRef.current = setTimeout(() => {
        if (!activeJob) {
          const pendingJobs = jobs.filter((j) => j.status === "pending");
          if (pendingJobs.length > 0) {
            setJobOffer({
              job: pendingJobs[0],
              expiresAt: Date.now() + 30000,
              bonusMultiplier: Math.random() > 0.5 ? 1.5 : undefined,
            });
            setNotificationCount((prev) => prev + 1);
          }
        }
      }, offerDelay);
    } else {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
        positionIntervalRef.current = null;
      }
      if (jobOfferTimerRef.current) {
        clearTimeout(jobOfferTimerRef.current);
        jobOfferTimerRef.current = null;
      }
    }

    return () => {
      if (positionIntervalRef.current) clearInterval(positionIntervalRef.current);
      if (jobOfferTimerRef.current) clearTimeout(jobOfferTimerRef.current);
    };
  }, [status, getAccessToken, activeJob, jobs]);

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

  const refreshJobsRef = useRef<(() => Promise<void>) | undefined>(undefined);

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

  refreshJobsRef.current = refreshJobs;

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      const data = notification.request.content.data as Record<string, unknown> | undefined;
      if (!data) return;

      const category = data.category as string | undefined;
      if (category === "delivery" || category === "transport") {
        const action = data.action as string | undefined;

        if (action === "new_job" && data.job) {
          const newJob = data.job as DriverJob;
          setJobs((prev) => {
            if (prev.some((j) => j.id === newJob.id)) return prev;
            return [...prev, newJob];
          });
          setNotificationCount((prev) => prev + 1);
        } else if (action === "job_cancelled" && data.jobId) {
          setJobs((prev) => prev.map((j) =>
            j.id === data.jobId ? { ...j, status: "cancelled" as const } : j
          ));
        } else if (action === "job_updated" && data.job) {
          const updatedJob = data.job as DriverJob;
          setJobs((prev) => prev.map((j) =>
            j.id === updatedJob.id ? updatedJob : j
          ));
        } else {
          refreshJobsRef.current?.();
        }
      }
    });

    return () => subscription.remove();
  }, []);

  const acceptJobFn = useCallback(async (jobId: string) => {
    const token = await getAccessToken();
    const job = await apiAcceptJob(jobId, token || undefined);
    if (job) {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? job : j)));
      return true;
    }
    await enqueueOffline("acceptJob", { jobId });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "accepted" as const, acceptedAt: new Date().toISOString() } : j)));
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
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "in_transit" as const, pickedUpAt: new Date().toISOString() } : j)));
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
      setTodayEarnings((prev) => prev + result.earnings.amount);
      const completedJob = jobs.find((j) => j.id === jobId);
      if (completedJob?.tip) setTodayTips((prev) => prev + completedJob.tip!);
      return true;
    }
    await enqueueOffline("complete", { jobId, ...proof });
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: "completed" as const, deliveredAt: new Date().toISOString() } : j)));
    setCompletedToday((prev) => prev + 1);
    const completedJob = jobs.find((j) => j.id === jobId);
    if (completedJob?.tip) setTodayTips((prev) => prev + completedJob.tip!);
    return true;
  }, [getAccessToken, enqueueOffline, jobs]);

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

  const getProfileFn = useCallback(async () => {
    const token = await getAccessToken();
    const data = await apiGetProfile(token || undefined);
    if (data) setProfile(data);
    return data;
  }, [getAccessToken]);

  const getVehiclesFn = useCallback(async () => {
    const token = await getAccessToken();
    return apiGetVehicles(token || undefined);
  }, [getAccessToken]);

  const getInspectionHistoryFn = useCallback(async () => {
    const token = await getAccessToken();
    return apiGetInspectionHistory(token || undefined);
  }, [getAccessToken]);

  const getShiftHistoryFn = useCallback(async () => {
    const token = await getAccessToken();
    return apiGetShiftHistory(token || undefined);
  }, [getAccessToken]);

  const dismissJobOffer = useCallback(() => {
    setJobOffer(null);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotificationCount(0);
  }, []);

  const updatePreferences = useCallback((prefs: Partial<DriverProfile["preferences"]>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, preferences: { ...prev.preferences, ...prefs } };
    });
  }, []);

  const acceptJobOfferFn = useCallback(async () => {
    if (!jobOffer) return false;
    const success = await acceptJobFn(jobOffer.job.id);
    setJobOffer(null);
    return success;
  }, [jobOffer, acceptJobFn]);

  return (
    <DriverContext.Provider value={{
      status,
      jobs,
      activeJob,
      completedToday,
      todayEarnings,
      todayTips,
      currency,
      isLoading,
      isOnline,
      offlineQueueCount: offlineQueue.length,
      profile,
      jobOffer,
      notificationCount,
      setStatus,
      refreshJobs,
      acceptJob: acceptJobFn,
      rejectJob: rejectJobFn,
      pickupJob,
      arriveAtCustomer,
      completeJob,
      getEarnings: getEarningsFn,
      submitInspection: submitInspectionFn,
      triggerSOS,
      getProfile: getProfileFn,
      getVehicles: getVehiclesFn,
      getInspectionHistory: getInspectionHistoryFn,
      getShiftHistory: getShiftHistoryFn,
      dismissJobOffer,
      acceptJobOffer: acceptJobOfferFn,
      clearNotifications,
      updatePreferences,
    }}>
      {children}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  return useContext(DriverContext);
}
