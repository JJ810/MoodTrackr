import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./components/dashboard";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

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
            <div className="flex flex-col bg-background text-foreground min-h-screen">
              <Header />
              <main className="h-full flex flex-1">
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
              <Footer />
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
