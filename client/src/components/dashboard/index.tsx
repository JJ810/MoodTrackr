import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { PlusCircle, BarChart2 } from "lucide-react";
import MoodChart from "../mood-logs/MoodChart";
import AddLogModal from "../mood-logs/AddLogModal";

const Dashboard = () => {
  const { user } = useAuth();
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);

  const handleAddLogClick = () => {
    setIsAddLogModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddLogModalOpen(false);
  };

  const handleLogSuccess = () => {
    // This will be called after a successful log submission
    // The chart will update automatically via WebSocket
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
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md w-full md:w-auto"
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

      <AddLogModal
        isOpen={isAddLogModalOpen}
        onClose={handleModalClose}
        onSuccess={handleLogSuccess}
      />
    </div>
  );
};

export default Dashboard;
