import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import RequestCard from "@/components/request-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InstructorDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const { data: openRequests = [] } = useQuery({
    queryKey: ["/api/training-requests"],
    queryFn: () => fetch("/api/training-requests").then(res => res.json()),
    enabled: !!userProfile?.profile,
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ["/api/applications", userProfile?.profile?.id],
    queryFn: () => fetch(`/api/applications?instructorId=${userProfile.profile.id}`).then(res => res.json()),
    enabled: !!userProfile?.profile?.id,
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

  // If no profile, redirect to profile creation
  if (userProfile && !userProfile.profile) {
    window.location.href = "/instructor-profile";
    return null;
  }

  const profile = userProfile?.profile;
  const filteredRequests = openRequests.filter((request: any) => {
    const minRate = parseFloat(profile?.minHourlyRate || "0");
    const maxRate = parseFloat(profile?.desiredHourlyRate || "999999");
    const requestMin = parseFloat(request.minBudget);
    const requestMax = parseFloat(request.maxBudget);
    
    // Check if there's overlap in budget ranges
    return requestMax >= minRate && requestMin <= maxRate;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.firstName}
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "/instructor-profile"}
            variant="outline"
            data-testid="button-edit-profile"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit Profile
          </Button>
        </div>

        {/* Profile Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <i className="fas fa-star text-yellow-500 text-2xl mr-2"></i>
                <span className="text-2xl font-bold" data-testid="text-rating">
                  {profile?.rating || "0.0"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold mb-2" data-testid="text-completed-sessions">
                {profile?.completedSessions || 0}
              </div>
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold mb-2 text-green-600" data-testid="text-total-earnings">
                ${profile?.totalEarnings || "0"}
              </div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                {profile?.isVerified ? (
                  <Badge className="verification-badge">
                    <i className="fas fa-check mr-1"></i>
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" data-testid="badge-verification-pending">
                    <i className="fas fa-clock mr-1"></i>
                    Pending
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Verification Status</p>
            </CardContent>
          </Card>
        </div>

        {/* My Applications */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">My Applications</h2>
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <i className="fas fa-clipboard-list text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground">
                  Browse available training requests below to start applying.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myApplications.map((application: any) => (
                <Card key={application.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {application.request?.title}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                          Proposed Rate: ${application.proposedRate}/hr
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied on {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        className={
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Opportunities */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Available Opportunities ({filteredRequests.length})
          </h2>
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <i className="fas fa-search text-4xl text-muted-foreground mb-4"></i>
                <h3 className="text-lg font-semibold mb-2">No matching opportunities</h3>
                <p className="text-muted-foreground">
                  We'll notify you when new training requests match your rate range.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request: any) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  instructorId={profile?.id}
                  onApplicationSubmitted={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
                    toast({
                      title: "Application Submitted",
                      description: "Your application has been sent to the company.",
                    });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
