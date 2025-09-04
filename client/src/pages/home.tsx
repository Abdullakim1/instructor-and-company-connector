import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const setupUserMutation = useMutation({
    mutationFn: async (userType: string) => {
      const response = await apiRequest("PUT", "/api/user/setup", { userType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Setup Complete",
        description: "Your account has been configured successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Setup Failed",
        description: "Failed to setup your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have userType set, show setup screen
  if (userProfile && !userProfile.userType) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Welcome to InstructorMatch!</h1>
            <p className="text-xl text-muted-foreground">
              Let's set up your account. Are you a company looking to hire instructors, or an instructor looking for opportunities?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="p-8 text-center card-hover">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-building text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">I'm a Company</h3>
              <p className="text-muted-foreground mb-6">
                I want to find and hire professional instructors for training
              </p>
              <Button 
                onClick={() => setupUserMutation.mutate("company")}
                disabled={setupUserMutation.isPending}
                className="w-full"
                data-testid="button-setup-company"
              >
                {setupUserMutation.isPending ? "Setting up..." : "Continue as Company"}
              </Button>
            </Card>

            <Card className="p-8 text-center card-hover">
              <div className="bg-accent/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chalkboard-teacher text-2xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">I'm an Instructor</h3>
              <p className="text-muted-foreground mb-6">
                I want to offer my expertise and get hired by companies
              </p>
              <Button 
                onClick={() => setupUserMutation.mutate("instructor")}
                disabled={setupUserMutation.isPending}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                data-testid="button-setup-instructor"
              >
                {setupUserMutation.isPending ? "Setting up..." : "Continue as Instructor"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Redirect based on user type and profile completion
  useEffect(() => {
    if (userProfile?.userType) {
      if (userProfile.userType === "company") {
        if (!userProfile.profile) {
          // Company needs to complete profile
          setLocation("/company-dashboard");
        } else {
          setLocation("/company-dashboard");
        }
      } else if (userProfile.userType === "instructor") {
        if (!userProfile.profile) {
          // Instructor needs to complete profile
          setLocation("/instructor-profile");
        } else {
          setLocation("/instructor-dashboard");
        }
      }
    }
  }, [userProfile, setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Welcome back, {userProfile?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Setting up your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}
