import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardCard } from "./DashboardCard";
import { BarChart2, Calendar, Lightbulb } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user?.name}</CardTitle>
          <CardDescription>Track your mental health journey</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Daily Log"
          description="Record your mood and activities for today."
          buttonText="Add Entry"
          icon={<Calendar className="h-5 w-5" />}
          onClick={() => console.log("Add entry clicked")}
        />

        <DashboardCard
          title="Progress"
          description="View your mental health trends over time."
          buttonText="View Charts"
          icon={<BarChart2 className="h-5 w-5" />}
          onClick={() => console.log("View charts clicked")}
        />

        <DashboardCard
          title="Insights"
          description="Get personalized insights based on your data."
          buttonText="View Insights"
          icon={<Lightbulb className="h-5 w-5" />}
          onClick={() => console.log("View insights clicked")}
        />
      </div>
    </div>
  );
};

export default Dashboard;
