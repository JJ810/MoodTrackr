import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { create } from 'zustand';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

import api from '@/lib/api';
import type { MoodLog } from '@/lib/api/types';

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
    [key: string]: string | number | boolean | undefined;
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
    socketCleanup?: () => void;

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

            // Use axios directly until we fully migrate to the new API structure
            const response = await api.get(`/api/logs?startDate=${startDate}&endDate=${endDate}`);
            const logs = response.data;

            if (logs) {
                const formattedData = logs.map((log: MoodLog) => ({
                    id: log.id,
                    date: log.date,
                    formattedDate: format(new Date(log.date), "MMM dd"),
                    mood: log.mood || 0,
                    anxiety: log.anxiety || 0,
                    sleepHours: log.sleepHours || 0,
                    sleepQuality: log.sleepQuality,
                    sleepDisturbances: log.sleepDisturbances || false,
                    physicalActivity: log.physicalActivity,
                    activityDuration: log.activityDuration,
                    socialInteractions: log.socialInteractions,
                    stressLevel: log.stressLevel || 0,
                    depressionSymptoms: log.depressionSymptoms || 'none',
                    anxietySymptoms: log.anxietySymptoms || 'none',
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
            toast.error("Failed to load mood data");
        } finally {
            set({ isLoading: false });
        }
    },

    initializeSocket: () => {
        // Check if we already have a socket connection
        const state = get();
        if (state.socket) {
            state.socket.disconnect();
        }

        const apiUrl = import.meta.env.VITE_API_URL;

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('Cannot initialize socket: No auth token available');
            toast.error('Authentication required for real-time updates');
            return;
        }

        const socket = io(apiUrl, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnection: true,
            autoConnect: true,
            transports: ['polling', 'websocket'],
            path: '/socket.io', // Explicitly set the socket.io path
            auth: {
                token
            }
        });

        set({ socket });

        // Set up event listeners
        socket.on('connect', () => {
            console.log('Socket connected with ID:', socket.id);
            toast.success('Real-time updates connected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            toast.error('Failed to connect to real-time updates');
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected. Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Debug event to check if socket is receiving any events
        socket.onAny((event, ...args) => {
            console.log(`Socket received event: ${event}`, args);
        });

        socket.on('log:created', (data) => {
            console.log("Raw log:created event data:", data);

            // Check if the data contains the newLog property
            if (!data || !data.newLog) {
                console.error('Invalid log:created event data structure:', data);
                return;
            }

            const newLog = data.newLog;
            console.log("Extracted newLog data:", newLog);
            const state = get();
            // Use dayjs for proper timezone handling
            const dateStr = dayjs(newLog.date).format('YYYY-MM-DD'); // Extract YYYY-MM-DD part
            console.log('Processing log date:', dateStr);

            // Create date object without timezone conversion issues using dayjs
            const logDate = dayjs(dateStr).hour(12).minute(0).second(0).toDate(); // Use noon to avoid day shifts
            console.log('Parsed log date object:', logDate);

            let shouldAddToChart = false;
            if (state.viewMode === "weekly") {
                const weekStart = startOfWeek(new Date());
                const weekEnd = endOfWeek(new Date());
                console.log('Week range:', weekStart, 'to', weekEnd);
                shouldAddToChart = logDate >= weekStart && logDate <= weekEnd;
            } else {
                const monthStart = startOfMonth(new Date());
                const monthEnd = endOfMonth(new Date());
                console.log('Month range:', monthStart, 'to', monthEnd);
                shouldAddToChart = logDate >= monthStart && logDate <= monthEnd;
            }

            console.log('Should add to chart:', shouldAddToChart);

            if (shouldAddToChart) {
                // Format the new log data
                const formattedNewLog: ChartData = {
                    id: newLog.id,
                    date: dateStr,
                    formattedDate: format(logDate, "MMM dd"),
                    mood: newLog.mood || 0,
                    anxiety: newLog.anxiety || 0,
                    sleepHours: newLog.sleepHours || 0,
                    sleepQuality: newLog.sleepQuality,
                    sleepDisturbances: newLog.sleepDisturbances || false,
                    physicalActivity: newLog.physicalActivity,
                    activityDuration: newLog.activityDuration,
                    socialInteractions: newLog.socialInteractions,
                    stressLevel: newLog.stressLevel || 0,
                    depressionSymptoms: newLog.depressionSymptoms || 'none',
                    anxietySymptoms: newLog.anxietySymptoms || 'none',
                    notes: newLog.notes,
                };

                const updatedData = [...state.chartData, formattedNewLog].sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                set({ chartData: updatedData });

                // Update the cache for the current view mode
                set((state) => {
                    const updatedCache = {
                        ...state.cachedData,
                        [state.viewMode]: updatedData
                    };
                    return { cachedData: updatedCache };
                });

                toast.success(`New mood log added for ${format(logDate, 'MMM dd')}`);
            } else {
                console.log('Log not added to chart because it\'s outside the current view range');
            }
        });

        // Handle mood log updated event
        socket.on('log:updated', (data) => {
            const updatedLog = data.updatedLog;
            console.log("Log updated event received with data:", updatedLog);
            const state = get();

            const updatedData = state.chartData.map((item) => {
                if (item.id === updatedLog.id) {
                    return {
                        ...item,
                        mood: updatedLog.moodRating || item.mood || 0,
                        anxiety: updatedLog.anxietyLevel || item.anxiety || 0,
                        sleepHours: updatedLog.sleepHours || item.sleepHours || 0,
                        sleepQuality: updatedLog.sleepQuality !== undefined
                            ? updatedLog.sleepQuality
                            : item.sleepQuality,
                        physicalActivity: updatedLog.physicalActivity?.type || item.physicalActivity,
                        activityDuration: updatedLog.physicalActivity?.duration !== undefined
                            ? updatedLog.physicalActivity.duration
                            : item.activityDuration,
                        socialInteractions: updatedLog.socialInteractions !== undefined
                            ? updatedLog.socialInteractions
                            : item.socialInteractions,
                        stressLevel: updatedLog.stressLevel || item.stressLevel || 0,
                        depressionSymptoms: updatedLog.symptoms?.depression ? 'present' : 'none',
                        anxietySymptoms: updatedLog.symptoms?.anxiety ? 'present' : 'none',
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

            toast.success(`Mood log updated for ${format(new Date(updatedLog.date), "MMM dd")}`);
        });

        // Handle mood log deleted event
        socket.on('log:deleted', (data) => {
            const deletedLogId = data.deletedLogId;
            console.log("Log deleted event received with ID:", deletedLogId);
            const state = get();

            const updatedData = state.chartData.filter((item) => item.id !== deletedLogId);

            set({ chartData: updatedData });

            set((state) => ({
                cachedData: {
                    ...state.cachedData,
                    [state.viewMode]: updatedData,
                }
            }));

            toast.success("Mood log deleted");
        });

        // Store the socket and unsubscribe functions for cleanup
        set({
            socket,
            socketCleanup: () => {
                socket.off('log:created');
                socket.off('log:updated');
                socket.off('log:deleted');
                socket.disconnect();
            }
        });
    },

    disconnectSocket: () => {
        const state = get();

        if (state.socket) {
            state.socket.disconnect();
            console.log('Socket disconnected manually');
        }

        set({
            socket: null
        });
    },
}));

export default useMoodStore;
