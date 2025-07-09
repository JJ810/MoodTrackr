import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/dashboard/Dashboard";
import Header from "./components/layout/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function App() {
  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
      onScriptLoadError={() =>
        console.error("Google OAuth script failed to load")
      }
      onScriptLoadSuccess={() =>
        console.log("Google OAuth script loaded successfully")
      }
    >
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Router>
            <div className="flex flex-col bg-background text-foreground h-screen">
              <Header />
              <main className="flex-1 h-[calc(100%-8rem)]">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                  </Route>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
              <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
                <div className="container mx-auto">
                  © {new Date().getFullYear()} MoodTrackr. All rights reserved.
                </div>
              </footer>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
