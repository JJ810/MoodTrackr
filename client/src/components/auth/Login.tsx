import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-hooks";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    setIsLoading(true);
    try {
      console.log("Google login successful", {
        hasCredential: !!credentialResponse.credential,
        credentialLength: credentialResponse.credential?.length || 0,
        clientId: credentialResponse.clientId,
        selectBy: credentialResponse.select_by,
      });

      const token = credentialResponse.credential;

      if (!token) {
        console.error("No credential token received from Google");
        toast.error(
          "Authentication failed: No credential received from Google"
        );
        return;
      }

      // Attempt to login with the token
      await login(token);

      console.log("Login successful, redirecting to dashboard...");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error: unknown) => {
    console.error("Google login failed:", error);
    setIsLoading(false);
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4 my-auto">
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
              <CardHeader className="text-center lg:text-left">
                <CardTitle className="text-3xl">Welcome!</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>

              {isLoading ? (
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="text-card-foreground font-medium">
                      Signing in...
                    </span>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="space-y-8 mt-4">
                  <div className="flex items-center justify-center">
                    <Separator className="shrink w-1/3" />
                    <span className="px-3 text-xs uppercase text-card-foreground/60 whitespace-nowrap">
                      Sign in with
                    </span>
                    <Separator className="shrink w-1/3" />
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
                </CardContent>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
