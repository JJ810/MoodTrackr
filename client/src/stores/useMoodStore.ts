import axios from 'axios';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

export interface LogData {
    id: string;
    date: string;
    mood: number;
    anxiety: number;
    sleepHours: number;
    stressLevel: number;
    sleepQuality?: number;
    sleepDisturbances?: boolean;
    physicalActivity?: string;
    activityDuration?: number;
    socialInteractions?: number;
    depressionSymptoms?: string;
    anxietySymptoms?: string;
    notes?: string;
    [key: string]: any;
}

export interface ChartData {
    id?: string;
    date: string;
    formattedDate: string;
    mood: number;
    anxiety: number;
    sleepHours: number;
    sleepQuality?: number;
    sleepDisturbances?: boolean;
    physicalActivity?: string;
    activityDuration?: number;
    socialInteractions?: number;
    stressLevel: number;
    depressionSymptoms?: string;
    anxietySymptoms?: string;
    notes?: string;
}

export type ViewMode = "weekly" | "monthly";

interface MoodState {
    chartData: ChartData[];
    isLoading: boolean;
    viewMode: ViewMode;
    cachedData: {
        weekly: ChartData[];
        monthly: ChartData[];
    };
    socket: Socket | null;

    setViewMode: (mode: ViewMode) => void;
    setChartData: (data: ChartData[]) => void;
    setCachedData: (data: { weekly?: ChartData[]; monthly?: ChartData[] }) => void;
    fetchData: (mode?: ViewMode) => Promise<void>;
    initializeSocket: () => void;
    disconnectSocket: () => void;
}

const useMoodStore = create<MoodState>((set, get) => ({
    chartData: [],
    isLoading: true,
    viewMode: "weekly",
    cachedData: { weekly: [], monthly: [] },
    socket: null,

    setViewMode: (mode) => set({ viewMode: mode }),

    setChartData: (data) => set({ chartData: data }),

    setCachedData: (data) => set((state) => ({
        cachedData: {
            ...state.cachedData,
            ...data
        }
    })),

    fetchData: async (mode = get().viewMode) => {
        // If a specific mode is passed, update the view mode
        if (mode) {
            set({ viewMode: mode });
        } else {
            // Use the current view mode if none is specified
            mode = get().viewMode;
        }
        
        set({ isLoading: true });
        try {
            let startDate, endDate;

            if (mode === "weekly") {
                startDate = format(startOfWeek(new Date()), "yyyy-MM-dd");
                endDate = format(endOfWeek(new Date()), "yyyy-MM-dd");
            } else {
                startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
                endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");
            }

            console.log(`Fetching data for ${mode} view: ${startDate} to ${endDate}`);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/logs/summary`,
                {
                    params: {
                        startDate,
                        endDate,
                        metrics:
                            "mood,anxiety,sleepHours,sleepQuality,sleepDisturbances,physicalActivity,activityDuration,socialInteractions,stressLevel,depressionSymptoms,anxietySymptoms,notes",
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            if (response.data && response.data.logs) {
                const formattedData = response.data.logs.map((log: LogData) => ({
                    id: log.id,
                    date: log.date,
                    formattedDate: format(new Date(log.date), "MMM dd"),
                    mood: log.mood || 0,
                    anxiety: log.anxiety || 0,
                    sleepHours: log.sleepHours || 0,
                    sleepQuality: log.sleepQuality,
                    sleepDisturbances: log.sleepDisturbances,
                    physicalActivity: log.physicalActivity,
                    activityDuration: log.activityDuration,
                    socialInteractions: log.socialInteractions,
                    stressLevel: log.stressLevel || 0,
                    depressionSymptoms: log.depressionSymptoms,
                    anxietySymptoms: log.anxietySymptoms,
                    notes: log.notes,
                }));

                set({ chartData: formattedData });

                set((state) => ({
                    cachedData: {
                        ...state.cachedData,
                        [mode]: formattedData,
                    }
                }));
            }
        } catch (error) {
            console.error("Error fetching log data:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    initializeSocket: () => {
        const socket = io(import.meta.env.VITE_WS_URL || "http://localhost:3000", {
            auth: {
                token: localStorage.getItem("authToken"),
            },
        });

        socket.on("connect", () => {
            console.log("Connected to WebSocket server");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from WebSocket server");
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        socket.on("log:created", (data) => {
            console.log("Log created event received with data:", data);
            const state = get();

            if (data.summaryData) {
                set({
                    cachedData: {
                        weekly: data.summaryData.weekly,
                        monthly: data.summaryData.monthly,
                    }
                });

                const newChartData =
                    state.viewMode === "weekly"
                        ? data.summaryData.weekly
                        : data.summaryData.monthly;
                set({ chartData: newChartData, isLoading: false });
            } else if (data.newLog) {
                const newLog = data.newLog;
                const logDate = new Date(newLog.date);

                let shouldAddToChart = false;
                if (state.viewMode === "weekly") {
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    shouldAddToChart = logDate >= weekStart && logDate <= weekEnd;
                } else {
                    const monthStart = startOfMonth(new Date());
                    const monthEnd = endOfMonth(new Date());
                    shouldAddToChart = logDate >= monthStart && logDate <= monthEnd;
                }

                if (shouldAddToChart) {
                    // Format the new log data
                    const formattedNewLog: ChartData = {
                        id: newLog.id,
                        date: newLog.date,
                        formattedDate: format(new Date(newLog.date), "MMM dd"),
                        mood: newLog.mood || 0,
                        anxiety: newLog.anxiety || 0,
                        sleepHours: newLog.sleepHours || 0,
                        sleepQuality: newLog.sleepQuality,
                        sleepDisturbances: newLog.sleepDisturbances,
                        physicalActivity: newLog.physicalActivity,
                        activityDuration: newLog.activityDuration,
                        socialInteractions: newLog.socialInteractions,
                        stressLevel: newLog.stressLevel || 0,
                        depressionSymptoms: newLog.depressionSymptoms,
                        anxietySymptoms: newLog.anxietySymptoms,
                        notes: newLog.notes,
                    };

                    const updatedData = [...state.chartData, formattedNewLog].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );

                    set({ chartData: updatedData });

                    // Update the cache for the current view mode
                    set((state) => ({
                        cachedData: {
                            ...state.cachedData,
                            [state.viewMode]: updatedData,
                        }
                    }));
                }
            } else {
                get().fetchData(state.viewMode);
            }
        });

        socket.on("log:updated", (data) => {
            console.log("Log updated event received with data:", data);
            const state = get();

            if (data.summaryData) {
                set({
                    cachedData: {
                        weekly: data.summaryData.weekly,
                        monthly: data.summaryData.monthly,
                    }
                });

                const newChartData =
                    state.viewMode === "weekly"
                        ? data.summaryData.weekly
                        : data.summaryData.monthly;
                set({ chartData: newChartData, isLoading: false });
            } else if (data.updatedLog) {
                const updatedLog = data.updatedLog;

                const updatedData = state.chartData.map((item) => {
                    if (item.date === updatedLog.date) {
                        return {
                            ...item,
                            mood: updatedLog.mood || item.mood || 0,
                            anxiety: updatedLog.anxiety || 0,
                            sleepHours: updatedLog.sleepHours || 0,
                            sleepQuality:
                                updatedLog.sleepQuality !== undefined
                                    ? updatedLog.sleepQuality
                                    : item.sleepQuality,
                            sleepDisturbances:
                                updatedLog.sleepDisturbances !== undefined
                                    ? updatedLog.sleepDisturbances
                                    : item.sleepDisturbances,
                            physicalActivity:
                                updatedLog.physicalActivity || item.physicalActivity,
                            activityDuration:
                                updatedLog.activityDuration !== undefined
                                    ? updatedLog.activityDuration
                                    : item.activityDuration,
                            socialInteractions:
                                updatedLog.socialInteractions !== undefined
                                    ? updatedLog.socialInteractions
                                    : item.socialInteractions,
                            stressLevel: updatedLog.stressLevel || 0,
                            depressionSymptoms:
                                updatedLog.depressionSymptoms || item.depressionSymptoms,
                            anxietySymptoms:
                                updatedLog.anxietySymptoms || item.anxietySymptoms,
                            notes: updatedLog.notes || item.notes,
                        };
                    }
                    return item;
                });

                set({ chartData: updatedData });

                set((state) => ({
                    cachedData: {
                        ...state.cachedData,
                        [state.viewMode]: updatedData,
                    }
                }));
            } else {
                get().fetchData(state.viewMode);
            }
        });

        socket.on("log:deleted", (data) => {
            console.log("Log deleted event received with data:", data);
            const state = get();

            if (data.summaryData) {
                set({
                    cachedData: {
                        weekly: data.summaryData.weekly,
                        monthly: data.summaryData.monthly,
                    }
                });

                const newChartData =
                    state.viewMode === "weekly"
                        ? data.summaryData.weekly
                        : data.summaryData.monthly;
                set({ chartData: newChartData, isLoading: false });
            } else if (data.deletedLogId) {
                const updatedData = state.chartData.filter((item) => item.id !== data.deletedLogId);

                set({ chartData: updatedData });

                set((state) => ({
                    cachedData: {
                        ...state.cachedData,
                        [state.viewMode]: updatedData,
                    }
                }));

                get().fetchData(state.viewMode);
            } else {
                get().fetchData(state.viewMode);
            }
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            console.log("Cleaning up socket connection");
            socket.disconnect();
            set({ socket: null });
        }
    },
}));

export default useMoodStore;
