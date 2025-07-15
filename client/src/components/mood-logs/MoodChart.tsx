import { Button } from "@/components/ui/button";
import type { ChartData } from "@/stores/useMoodStore";
import useMoodStore from "@/stores/useMoodStore";
import { LineChart as LineChartIcon } from "lucide-react";
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

export function MoodChart() {
  const { chartData, isLoading, viewMode, setViewMode, fetchData } =
    useMoodStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <LineChartIcon className="h-5 w-5" /> Mood Metrics
        </h2>
        <div className="flex space-x-2 w-full sm:w-auto chart-controls">
          <Button
            variant={viewMode === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setViewMode("weekly");
              fetchData("weekly");
            }}
            className={`flex-1 sm:flex-initial ${
              viewMode === "weekly"
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                : "dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Weekly
          </Button>
          <Button
            variant={viewMode === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setViewMode("monthly");
              fetchData("monthly");
            }}
            className={`flex-1 sm:flex-initial ${
              viewMode === "monthly"
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                : "dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
            }`}
          >
            Monthly
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <LineChartIcon className="animate-pulse h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 shadow">
          <LineChartIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No data available for the selected period
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 sm:p-4 shadow overflow-hidden">
          <ResponsiveContainer
            width="99%"
            height={300}
            className="mt-2 md:mt-0 md:h-[400px] -ml-2 sm:ml-0"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                className="dark:opacity-30"
              />
              <XAxis
                dataKey="formattedDate"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                className="dark:text-gray-300"
                tickMargin={5}
                height={40}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  if (window.innerWidth < 500) {
                    const parts = value.split(" ");
                    return parts.length > 1
                      ? `${parts[0]} ${parts[1].slice(0, 2)}`
                      : value;
                  }
                  return value;
                }}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                className="dark:text-gray-300"
                width={20}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartData;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md max-w-[250px] md:max-w-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Date: {label}
                        </h3>
                        <div className="space-y-2 text-sm dark:text-gray-300">
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
                            <div className="flex flex-col mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
              <Legend
                wrapperStyle={{
                  paddingTop: "5px",
                  fontSize: "10px",
                  color: "#6b7280",
                }}
                iconSize={8}
                className="dark:text-gray-300"
              />
              <Line
                type="monotone"
                dataKey="mood"
                name="Mood Rating"
                stroke="#4f46e5"
                activeDot={{ r: 6, strokeWidth: 1 }}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                name="Anxiety Level"
                stroke="#8884d8"
                activeDot={{ r: 6, strokeWidth: 1 }}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="sleepHours"
                name="Sleep Hours"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="stressLevel"
                name="Stress Level"
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
