import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { LineChart as LineChartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { io } from "socket.io-client";

interface LogData {
  id: string;
  date: string;
  mood: number;
  anxiety: number;
  sleepHours: number;
  stressLevel: number;
  [key: string]: any;
}

interface ChartData {
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

type ViewMode = "weekly" | "monthly";

export function MoodChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cachedData, setCachedData] = useState<{
    weekly: ChartData[];
    monthly: ChartData[];
  }>({ weekly: [], monthly: [] });
  const {} = useAuth(); // Auth context is used for WebSocket authentication via token

  const fetchData = async (mode: ViewMode = viewMode) => {
    setIsLoading(true);
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

        setChartData(formattedData);

        setCachedData((prev) => ({
          ...prev,
          [mode]: formattedData,
        }));
      }
    } catch (error) {
      console.error("Error fetching log data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Initial data fetch");
    fetchData(viewMode);
  }, []);

  // Set up Socket.IO connection for real-time updates
  useEffect(() => {
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

      if (data.summaryData) {
        setCachedData({
          weekly: data.summaryData.weekly,
          monthly: data.summaryData.monthly,
        });

        const newChartData =
          viewMode === "weekly"
            ? data.summaryData.weekly
            : data.summaryData.monthly;
        setChartData(newChartData);
        setIsLoading(false);
      } else if (data.newLog) {
        const newLog = data.newLog;
        const logDate = new Date(newLog.date);

        let shouldAddToChart = false;
        if (viewMode === "weekly") {
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

          setChartData((prevData) => {
            const updatedData = [...prevData, formattedNewLog].sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            // Update the cache for the current view mode
            setCachedData((prev) => ({
              ...prev,
              [viewMode]: updatedData,
            }));

            return updatedData;
          });
        }
      } else {
        // Fallback to API call if no data is provided
        fetchData(viewMode);
      }
    });

    socket.on("log:updated", (data) => {
      console.log("Log updated event received with data:", data);
      if (data.summaryData) {
        // Cache both weekly and monthly data
        setCachedData({
          weekly: data.summaryData.weekly,
          monthly: data.summaryData.monthly,
        });

        // Update chart data based on current view mode
        const newChartData =
          viewMode === "weekly"
            ? data.summaryData.weekly
            : data.summaryData.monthly;
        setChartData(newChartData);
        setIsLoading(false);
      } else if (data.updatedLog) {
        // If we only have the updated log but no summary data, update it in the existing chart data
        const updatedLog = data.updatedLog;

        // Update the log in the chart data
        setChartData((prevData) => {
          const updatedData = prevData.map((item) => {
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

          // Update the cache for the current view mode
          setCachedData((prev) => ({
            ...prev,
            [viewMode]: updatedData,
          }));

          return updatedData;
        });
      } else {
        // Fallback to API call if no data is provided
        fetchData(viewMode);
      }
    });

    socket.on("log:deleted", (data) => {
      console.log("Log deleted event received with data:", data);
      if (data.summaryData) {
        // Cache both weekly and monthly data
        setCachedData({
          weekly: data.summaryData.weekly,
          monthly: data.summaryData.monthly,
        });

        const newChartData =
          viewMode === "weekly"
            ? data.summaryData.weekly
            : data.summaryData.monthly;
        setChartData(newChartData);
        setIsLoading(false);
      } else if (data.deletedLogId) {
        setChartData((prevData) => {
          const updatedData = prevData.filter(() => {
            return true;
          });

          setCachedData((prev) => ({
            ...prev,
            [viewMode]: updatedData,
          }));

          fetchData(viewMode);

          return updatedData;
        });
      } else {
        fetchData(viewMode);
      }
    });

    return () => {
      console.log("Cleaning up socket connection");
      socket.disconnect();
    };
  }, [viewMode]); // Re-connect when viewMode changes to ensure correct data is received

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Mood Metrics</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (cachedData.weekly.length > 0) {
                setViewMode("weekly");
                setChartData(cachedData.weekly);
              } else {
                setViewMode("weekly");
                fetchData("weekly");
              }
            }}
            className={
              viewMode === "weekly" ? "bg-indigo-600 hover:bg-indigo-700" : ""
            }
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (cachedData.monthly.length > 0) {
                setViewMode("monthly");
                setChartData(cachedData.monthly);
              } else {
                setViewMode("monthly");
                fetchData("monthly");
              }
            }}
            className={
              viewMode === "monthly" ? "bg-indigo-600 hover:bg-indigo-700" : ""
            }
          >
            Monthly
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-muted/10 rounded-lg border border-dashed border-muted">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
            <div className="h-4 w-32 bg-muted rounded mb-2"></div>
            <div className="h-3 w-24 bg-muted rounded"></div>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 bg-muted/10 rounded-lg border border-dashed border-muted">
          <LineChartIcon
            className="text-muted-foreground mb-4"
            size={48}
            strokeWidth={1}
          />
          <p className="text-muted-foreground font-medium mb-2">
            No data available for the selected period
          </p>
          <p className="text-sm text-muted-foreground">
            Add a log to see your metrics
          </p>
        </div>
      ) : (
        <div className="rounded-lg border p-4 bg-card">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="formattedDate" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartData;
                    return (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md max-w-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Date: {label}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {data.mood !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">Mood:</span>
                              <span>{data.mood}/5</span>
                            </div>
                          )}
                          {data.anxiety !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Anxiety Level:
                              </span>
                              <span>{data.anxiety}/5</span>
                            </div>
                          )}
                          {data.stressLevel !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">Stress Level:</span>
                              <span>{data.stressLevel}/5</span>
                            </div>
                          )}
                          {data.sleepHours !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">Sleep Hours:</span>
                              <span>{data.sleepHours} hours</span>
                            </div>
                          )}
                          {data.sleepQuality !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Sleep Quality:
                              </span>
                              <span>
                                {data.sleepQuality === 1
                                  ? "Poor"
                                  : data.sleepQuality === 2
                                  ? "Fair"
                                  : data.sleepQuality === 3
                                  ? "Good"
                                  : data.sleepQuality === 4
                                  ? "Excellent"
                                  : "N/A"}
                              </span>
                            </div>
                          )}
                          {data.sleepDisturbances !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Sleep Disturbances:
                              </span>
                              <span>
                                {data.sleepDisturbances ? "Yes" : "No"}
                              </span>
                            </div>
                          )}
                          {data.physicalActivity && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Physical Activity:
                              </span>
                              <span>{data.physicalActivity}</span>
                            </div>
                          )}
                          {data.activityDuration !== undefined &&
                            data.activityDuration !== null && (
                              <div className="flex justify-between">
                                <span className="font-medium">
                                  Activity Duration:
                                </span>
                                <span>{data.activityDuration} minutes</span>
                              </div>
                            )}
                          {data.socialInteractions !== undefined && (
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Social Interactions:
                              </span>
                              <span>
                                {data.socialInteractions === 1
                                  ? "None"
                                  : data.socialInteractions === 2
                                  ? "Minimal"
                                  : data.socialInteractions === 3
                                  ? "Moderate"
                                  : data.socialInteractions === 4
                                  ? "High"
                                  : "N/A"}
                              </span>
                            </div>
                          )}
                          {data.depressionSymptoms && (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Depression Symptoms:
                              </span>
                              <span className="text-xs mt-1">
                                {data.depressionSymptoms}
                              </span>
                            </div>
                          )}
                          {data.anxietySymptoms && (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                Anxiety Symptoms:
                              </span>
                              <span className="text-xs mt-1">
                                {data.anxietySymptoms}
                              </span>
                            </div>
                          )}
                          {data.notes && (
                            <div className="flex flex-col mt-2 pt-2 border-t border-gray-200">
                              <span className="font-medium">Notes:</span>
                              <span className="text-xs mt-1">{data.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mood"
                name="Mood Rating"
                stroke="#4f46e5"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                name="Anxiety Level"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="sleepHours"
                name="Sleep Hours"
                stroke="#82ca9d"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="stressLevel"
                name="Stress Level"
                stroke="#ff7300"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
