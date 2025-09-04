import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import CompanyRequestForm from "@/components/company-request-form";
import InstructorCard from "@/components/instructor-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompanyDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const { data: trainingRequests = [] } = useQuery({
    queryKey: ["/api/training-requests"],
    queryFn: () => fetch("/api/training-requests?type=company").then(res => res.json()),
    enabled: !!userProfile?.profile,
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/companies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setShowProfileForm(false);
      toast({
        title: "Profile Created",
        description: "Your company profile has been created successfully.",
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
        title: "Error",
        description: "Failed to create company profile.",
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
    }
  }, [user, isLoading, toast]);

  useEffect(() => {
    if (userProfile && userProfile.userType !== "company") {
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

  // Show company profile setup form if no profile exists
  if (userProfile && !userProfile.profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Complete Your Company Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());
                  createCompanyMutation.mutate(data);
                }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      required
                      placeholder="Your company name"
                      data-testid="input-company-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select name="industry">
                      <SelectTrigger data-testid="select-industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select name="companySize">
                      <SelectTrigger data-testid="select-company-size">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="City, State"
                      data-testid="input-location"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://www.yourcompany.com"
                    data-testid="input-website"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    placeholder="Tell us about your company..."
                    data-testid="textarea-description"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createCompanyMutation.isPending}
                  className="w-full"
                  data-testid="button-create-profile"
                >
                  {createCompanyMutation.isPending ? "Creating..." : "Create Company Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userProfile?.profile?.companyName}
            </p>
          </div>
          <Button
            onClick={() => setShowRequestForm(true)}
            data-testid="button-post-request"
          >
            <i className="fas fa-plus mr-2"></i>
            Post New Request
          </Button>
        </div>

        {showRequestForm && (
          <div className="mb-8">
            <CompanyRequestForm
              onSuccess={() => {
                setShowRequestForm(false);
                queryClient.invalidateQueries({ queryKey: ["/api/training-requests"] });
              }}
              onCancel={() => setShowRequestForm(false)}
            />
          </div>
        )}

        {/* Training Requests */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Your Training Requests</h2>
            {trainingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <i className="fas fa-clipboard-list text-4xl text-muted-foreground mb-4"></i>
                  <h3 className="text-lg font-semibold mb-2">No training requests yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first training request to get started with finding instructors.
                  </p>
                  <Button onClick={() => setShowRequestForm(true)}>
                    Post Your First Request
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {trainingRequests.map((request: any) => (
                  <Card key={request.id} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2" data-testid={`text-request-title-${request.id}`}>
                            {request.title}
                          </h3>
                          <p className="text-muted-foreground mb-2">{request.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Budget: ${request.minBudget} - ${request.maxBudget}/hr</span>
                            <span>Duration: {request.duration}</span>
                            <span>Type: {request.trainingType}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'open' ? 'bg-green-100 text-green-800' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" size="sm">
                          View Applications
                        </Button>
                        <Button size="sm">
                          Edit Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
