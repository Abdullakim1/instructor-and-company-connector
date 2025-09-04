import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    trainingType: string;
    duration: string;
    minBudget: string;
    maxBudget: string;
    location?: string;
    isRemote: boolean;
    preferredStartDate?: string;
    status: string;
    createdAt: string;
  };
  instructorId: string;
  onApplicationSubmitted: () => void;
}

export default function RequestCard({ request, instructorId, onApplicationSubmitted }: RequestCardProps) {
  const { toast } = useToast();
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposedRate: "",
    coverLetter: "",
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/applications", data);
      return response.json();
    },
    onSuccess: () => {
      setShowApplicationDialog(false);
      setApplicationData({ proposedRate: "", coverLetter: "" });
      toast({
        title: "Application Submitted",
        description: "Your application has been sent to the company. You'll be notified of their response.",
      });
      onApplicationSubmitted();
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
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationData.proposedRate || !applicationData.coverLetter) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const proposedRate = parseFloat(applicationData.proposedRate);
    const minBudget = parseFloat(request.minBudget);
    const maxBudget = parseFloat(request.maxBudget);

    if (proposedRate < minBudget || proposedRate > maxBudget) {
      toast({
        title: "Rate Out of Range",
        description: `Your proposed rate must be between $${minBudget} and $${maxBudget} per hour.`,
        variant: "destructive",
      });
      return;
    }

    submitApplicationMutation.mutate({
      requestId: request.id,
      proposedRate: proposedRate,
      coverLetter: applicationData.coverLetter,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const daysAgo = Math.floor((Date.now() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-semibold" data-testid={`text-request-title-${request.id}`}>
                {request.title}
              </h3>
              <Badge 
                className={
                  request.status === 'open' ? 'bg-green-100 text-green-800' :
                  request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {request.status}
              </Badge>
            </div>
            
            <p className="text-muted-foreground mb-4" data-testid={`text-request-description-${request.id}`}>
              {request.description}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center">
                  <i className="fas fa-dollar-sign text-muted-foreground mr-2"></i>
                  <span data-testid={`text-request-budget-${request.id}`}>
                    ${request.minBudget} - ${request.maxBudget}/hr
                  </span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-muted-foreground mr-2"></i>
                  <span>{request.duration}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-tag text-muted-foreground mr-2"></i>
                  <span>{request.trainingType}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <i className={`fas ${request.isRemote ? 'fa-laptop' : 'fa-map-marker-alt'} text-muted-foreground mr-2`}></i>
                  <span>{request.isRemote ? 'Remote' : request.location || 'On-site'}</span>
                </div>
                {request.preferredStartDate && (
                  <div className="flex items-center">
                    <i className="fas fa-calendar text-muted-foreground mr-2"></i>
                    <span>Start: {formatDate(request.preferredStartDate)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <i className="fas fa-calendar-plus text-muted-foreground mr-2"></i>
                  <span className="text-muted-foreground">
                    Posted {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            data-testid={`button-view-details-${request.id}`}
          >
            <i className="fas fa-eye mr-2"></i>
            View Details
          </Button>
          
          <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
            <DialogTrigger asChild>
              <Button 
                size="sm"
                data-testid={`button-apply-${request.id}`}
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Apply Now
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Training Request</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div>
                  <Label htmlFor="proposedRate">Your Proposed Rate (per hour) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="proposedRate"
                      type="number"
                      min={request.minBudget}
                      max={request.maxBudget}
                      step="0.01"
                      value={applicationData.proposedRate}
                      onChange={(e) => setApplicationData({ ...applicationData, proposedRate: e.target.value })}
                      className="pl-8"
                      placeholder={`Between $${request.minBudget} - $${request.maxBudget}`}
                      required
                      data-testid="input-proposed-rate"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Rate must be within the company's budget range
                  </p>
                </div>

                <div>
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    rows={5}
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                    placeholder="Explain why you're the right fit for this training request. Highlight your relevant experience, approach, and what value you can provide..."
                    required
                    data-testid="textarea-cover-letter"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {applicationData.coverLetter.length}/500 characters recommended
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplicationDialog(false)}
                    data-testid="button-cancel-application"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitApplicationMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {submitApplicationMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
