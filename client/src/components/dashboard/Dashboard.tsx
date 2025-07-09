import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 rounded-lg bg-card p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Track your mental health journey</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-card p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Daily Log</h2>
          <p className="text-muted-foreground">Record your mood and activities for today.</p>
          <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Add Entry
          </button>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Progress</h2>
          <p className="text-muted-foreground">View your mental health trends over time.</p>
          <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            View Charts
          </button>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Insights</h2>
          <p className="text-muted-foreground">Get personalized insights based on your data.</p>
          <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            View Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
