import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      console.log("Google login successful", credentialResponse);
      // Get the ID token from the response
      const token = credentialResponse.credential;
      
      if (!token) {
        console.error("No credential token received from Google");
        return;
      }

      // Call the login function from AuthContext
      await login(token);
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        // Navigate to dashboard on successful login
        console.log("Redirecting to dashboard...");
        navigate("/dashboard", { replace: true });
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: any) => {
    console.error("Google login failed:", error);
    setIsLoading(false);
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card/10 backdrop-blur-sm border-border/20 rounded-3xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center relative">
              <div className="relative">
                <div className="bg-card rounded-lg p-4 w-48 h-64 shadow-lg transform rotate-3 border border-border">
                  <div className="bg-background rounded p-2 mb-3 border border-border">
                    <div className="w-full h-2 bg-muted rounded mb-2"></div>
                    <div className="w-3/4 h-2 bg-muted rounded"></div>
                  </div>
                  <div className="bg-primary/20 rounded-lg p-4 mb-4 border border-primary/30">
                    <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-2"></div>
                    <div className="w-full h-2 bg-primary/60 rounded mb-1"></div>
                    <div className="w-2/3 h-2 bg-primary/60 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2 bg-primary/40 rounded"></div>
                    <div className="w-4/5 h-2 bg-primary/40 rounded"></div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-muted rounded-full border-4 border-background"></div>
                  </div>
                </div>

                {/* Pills */}
                <div className="absolute -left-8 top-8 transform -rotate-12">
                  <div className="bg-card rounded-lg p-2 shadow-md border border-border">
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 bg-primary rounded-full"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -right-12 top-16">
                  <svg
                    width="80"
                    height="120"
                    viewBox="0 0 80 120"
                    className="text-card-foreground/60"
                  >
                    <path
                      d="M20 20 Q20 10 30 10 Q40 10 40 20 L40 60 Q40 80 60 80 Q70 80 70 70"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle cx="70" cy="70" r="8" fill="currentColor" />
                    <circle
                      cx="25"
                      cy="15"
                      r="6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="35"
                      cy="15"
                      r="6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="absolute -bottom-4 -right-8 transform rotate-12">
                  <div className="bg-primary rounded-lg p-2 w-16 h-20 shadow-lg">
                    <div className="bg-primary-foreground/20 rounded w-full h-8 mb-2"></div>
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-primary-foreground/40 rounded"></div>
                      <div className="w-2/3 h-1 bg-primary-foreground/40 rounded"></div>
                      <div className="w-1/2 h-1 bg-primary-foreground/40 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-8">
                  <div className="w-4 h-4 bg-accent rounded-full"></div>
                </div>
                <div className="absolute left-8 -bottom-2">
                  <div className="w-3 h-3 bg-card rounded-full border border-border"></div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative">
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">
                    Welcome!
                  </h1>
                  <p className="text-card-foreground/70">
                    Sign in to your account
                  </p>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="text-card-foreground font-medium">
                      Signing in...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/30"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card/10 backdrop-blur-sm px-3 text-card-foreground/60">
                          Sign in with
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => handleGoogleError("Login failed")}
                        useOneTap
                        shape="pill"
                        text="continue_with"
                        width="280px"
                        type="standard"
                        theme="outline"
                        logo_alignment="center"
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-card-foreground/60 text-xs">
                        By continuing, you agree to our{" "}
                        <button className="text-card-foreground hover:text-card-foreground/80 font-medium hover:underline transition-colors">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button className="text-card-foreground hover:text-card-foreground/80 font-medium hover:underline transition-colors">
                          Privacy Policy
                        </button>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
