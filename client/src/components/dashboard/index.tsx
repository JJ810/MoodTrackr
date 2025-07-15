import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useMoodStore from "@/stores/useMoodStore";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { BarChart2, HelpCircle, PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AddLogModal from "../mood-logs/AddLogModal";
import { MoodChart } from "../mood-logs/MoodChart";

const Dashboard = () => {
  const { user } = useAuth();
  const [isAddLogModalOpen, setIsAddLogModalOpen] = useState(false);
  const { initializeSocket, disconnectSocket, fetchData } = useMoodStore();
  const tourStartedRef = useRef(false);

  useEffect(() => {
    console.log("Dashboard: Initializing WebSocket connection");
    initializeSocket();
    fetchData();

    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour && !tourStartedRef.current) {
      tourStartedRef.current = true;
      setTimeout(() => {
        startTour();
      }, 500);
    }

    return () => {
      console.log("Dashboard: Cleaning up WebSocket connection");
      disconnectSocket();
    };
  }, []);

  const startTour = () => {
    const tour = introJs();
    tour.setOptions({
      steps: [
        {
          title: "Welcome to MoodTrackr",
          intro:
            "This tour will guide you through the main features of your mental health dashboard.",
        },
        {
          element: document.querySelector(".welcome-card"),
          title: "Welcome Section",
          intro:
            "This is your personal welcome area. You can see your profile information here.",
        },
        {
          element: document.querySelector(".add-log-button"),
          title: "Add New Log",
          intro:
            "Click here to add a new daily mental health log with details about your mood, anxiety, sleep, and more.",
        },
        {
          element: document.querySelector(".chart-card"),
          title: "Mental Health Dashboard",
          intro:
            "This chart displays your mental health metrics over time, helping you track patterns and progress.",
        },
        {
          element: document.querySelector(".chart-controls"),
          title: "View Controls",
          intro:
            "Switch between weekly and monthly views to analyze your data over different time periods.",
        },
      ],
      showBullets: true,
      showProgress: true,
      disableInteraction: false,
      hideNext: false,
      exitOnOverlayClick: false,
      doneLabel: "Finish Tour",
    });

    tour.oncomplete(() => {
      localStorage.setItem("hasSeenTour", "true");
    });

    tour.onexit(() => {
      localStorage.setItem("hasSeenTour", "true");
    });

    tour.start();
  };

  const handleAddLogClick = () => {
    setIsAddLogModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddLogModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-8">
        <Card className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none shadow-md welcome-card">
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

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  onClick={handleAddLogClick}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md w-full md:w-auto cursor-pointer add-log-button"
                  size="lg"
                >
                  <PlusCircle className="h-5 w-5" />
                  Add New Log
                </Button>

                <Button
                  onClick={startTour}
                  variant="outline"
                  className="flex items-center gap-2 shadow-md cursor-pointer help-button"
                  size="lg"
                >
                  <HelpCircle className="h-5 w-5" />
                  Help
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-md border-t-4 border-t-indigo-500 gap-0 chart-card">
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
