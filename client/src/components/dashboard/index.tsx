import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useMoodStore from "@/stores/useMoodStore";
import { BarChart2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AddLogModal from "../mood-logs/AddLogModal";
import { MoodChart } from "../mood-logs/MoodChart";

const Dashboard = () => {
  const { user } = useAuth();
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const { initializeSocket, disconnectSocket, fetchData } = useMoodStore();

  useEffect(() => {
    console.log("Dashboard: Initializing WebSocket connection");
    initializeSocket();
    fetchData();

    return () => {
      console.log("Dashboard: Cleaning up WebSocket connection");
      disconnectSocket();
    };
  }, []);

  const handleAddLogClick = () => {
    setIsAddLogModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddLogModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-8">
        <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-md">
          <CardHeader className="py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Welcome, {user?.name || "User"}
                </CardTitle>
                <CardDescription className="text-base">
                  Track your mental health journey
                </CardDescription>
              </div>

              <Button
                onClick={handleAddLogClick}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md w-full md:w-auto cursor-pointer"
                size="lg"
              >
                <PlusCircle className="h-5 w-5" />
                Add New Log
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-md border-t-4 border-t-indigo-500 gap-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                Mental Health Dashboard
              </CardTitle>
              <CardDescription className="text-sm">
                View and track your mental health metrics over time
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <MoodChart />
        </CardContent>
      </Card>

      <AddLogModal isOpen={isAddLogModalOpen} onClose={handleModalClose} />
    </div>
  );
};

export default Dashboard;
