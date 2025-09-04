import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import InstructorProfileForm from "@/components/instructor-profile-form";

export default function InstructorProfile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
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
    }
  }, [user, isLoading, toast]);

  useEffect(() => {
    if (userProfile && userProfile.userType !== "instructor") {
      window.location.href = "/";
    }
  }, [userProfile]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {userProfile?.profile ? "Update Your Profile" : "Create Your Instructor Profile"}
          </h1>
          <p className="text-muted-foreground">
            {userProfile?.profile 
              ? "Keep your profile up to date to attract more opportunities."
              : "Complete your profile to start receiving training opportunities from companies."
            }
          </p>
        </div>

        <InstructorProfileForm
          initialData={userProfile?.profile}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            toast({
              title: "Profile Updated",
              description: "Your instructor profile has been updated successfully.",
            });
          }}
        />
      </div>
    </div>
  );
}
