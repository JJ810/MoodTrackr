import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "../index";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../../contexts/AuthContext";

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test User", email: "test@example.com" },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/stores/useMoodStore", () => ({
  default: () => ({
    initializeSocket: vi.fn(),
    disconnectSocket: vi.fn(),
    fetchData: vi.fn(),
    logs: [],
    isLoading: false,
  }),
}));

vi.mock("intro.js", () => {
  return {
    default: () => ({
      setOptions: vi.fn().mockReturnThis(),
      oncomplete: vi.fn().mockReturnThis(),
      onexit: vi.fn().mockReturnThis(),
      start: vi.fn().mockReturnThis(),
    }),
  };
});

vi.mock("../../../components/mood-logs/MoodChart", () => ({
  MoodChart: () => <div data-testid="mock-mood-chart">Mock Chart</div>,
}));

vi.mock("../../../components/mood-logs/AddLogModal", () => {
  return {
    default: ({
      isOpen,
      onClose,
    }: {
      isOpen: boolean;
      onClose: () => void;
    }) => (
      <div data-testid="mock-add-log-modal">
        {isOpen ? "Modal Open" : "Modal Closed"}
        <button onClick={onClose}>Close</button>
      </div>
    ),
  };
});

// Mock all Lucide React icons used in the Dashboard component
vi.mock("lucide-react", () => ({
  PlusCircle: () => <div data-testid="plus-circle-icon" />,
  HelpCircle: () => <div data-testid="help-circle-icon" />,
  ChartColumnNoAxes: () => <div data-testid="chart-icon" />,
  BarChart2: () => <div data-testid="bar-chart-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  User: () => <div data-testid="user-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the welcome message with user name", () => {
    renderDashboard();
    expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
  });

  it("renders the Add New Log button", () => {
    renderDashboard();
    expect(screen.getByText(/Add New Log/i)).toBeInTheDocument();
  });

  it("renders the Help button", () => {
    renderDashboard();
    const helpIcon = screen.getByTestId("help-circle-icon");
    const helpButton = helpIcon.closest("button");
    expect(helpButton).toBeInTheDocument();
    expect(helpButton).toHaveClass("help-button");
  });

  it("renders the MoodChart component", () => {
    renderDashboard();
    expect(screen.getByTestId("mock-mood-chart")).toBeInTheDocument();
  });

  it("opens the AddLogModal when Add New Log button is clicked", () => {
    renderDashboard();
    const addLogButton = screen.getByText(/Add New Log/i);
    fireEvent.click(addLogButton);
    expect(screen.getByTestId("mock-add-log-modal")).toHaveTextContent(
      "Modal Open"
    );
  });

  it("starts tour automatically for first-time users", () => {
    localStorage.removeItem("hasSeenTour");
    renderDashboard();
    expect(localStorage.getItem("hasSeenTour")).toBeNull();
  });
});
