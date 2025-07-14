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
  date: string;
  formattedDate: string;
  anxiety: number;
  sleepHours: number;
  stressLevel: number;
}

type ViewMode = "weekly" | "monthly";

export function MoodChart() {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {} = useAuth(); // Auth context is used for WebSocket authentication via token

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let startDate, endDate;

      if (viewMode === "weekly") {
        startDate = format(startOfWeek(new Date()), "yyyy-MM-dd");
        endDate = format(endOfWeek(new Date()), "yyyy-MM-dd");
      } else {
        startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
        endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/logs/summary`,
        {
          params: {
            startDate,
            endDate,
            metrics: "anxiety,sleepHours,stressLevel",
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.logs) {
        const formattedData = response.data.logs.map((log: LogData) => ({
          date: log.date,
          formattedDate: format(new Date(log.date), "MMM dd"),
          anxiety: log.anxiety || 0,
          sleepHours: log.sleepHours || 0,
          stressLevel: log.stressLevel || 0,
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching log data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Socket.IO connection for real-time updates
  useEffect(() => {
    fetchData();

    // Set up socket connection for real-time updates
    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socket.on("connect", () => {
      console.log("Socket.IO connected");
    });

    // Listen for log events
    socket.on("log:created", () => {
      console.log("Log created event received");
      fetchData();
    });

    socket.on("log:updated", () => {
      console.log("Log updated event received");
      fetchData();
    });

    socket.on("log:deleted", () => {
      console.log("Log deleted event received");
      fetchData();
    });

    socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, [viewMode]);

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === "Sleep Hours" ? " hrs" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("weekly")}
            className={
              viewMode === "weekly" ? "bg-indigo-600 hover:bg-indigo-700" : ""
            }
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("monthly")}
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
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                stroke="#888888"
              />
              <YAxis stroke="#888888" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "10px",
                }}
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                name="Anxiety Level"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ stroke: "#8884d8", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#8884d8",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="sleepHours"
                name="Sleep Hours"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ stroke: "#82ca9d", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#82ca9d",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="stressLevel"
                name="Stress Level"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ stroke: "#ff7300", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#ff7300",
                  strokeWidth: 2,
                  fill: "#fff",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MoodChart;
