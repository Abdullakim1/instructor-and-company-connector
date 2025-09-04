import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface CompanyRequestFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CompanyRequestForm({ onSuccess, onCancel }: CompanyRequestFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trainingType: "",
    duration: "",
    minBudget: "",
    maxBudget: "",
    location: "",
    isRemote: false,
    preferredStartDate: "",
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/training-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Posted",
        description: "Your training request has been posted successfully. Instructors will be notified.",
      });
      onSuccess();
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
        description: "Failed to post training request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.minBudget || !formData.maxBudget) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.minBudget) >= parseFloat(formData.maxBudget)) {
      toast({
        title: "Validation Error",
        description: "Maximum budget must be greater than minimum budget.",
        variant: "destructive",
      });
      return;
    }

    createRequestMutation.mutate({
      ...formData,
      minBudget: parseFloat(formData.minBudget),
      maxBudget: parseFloat(formData.maxBudget),
      preferredStartDate: formData.preferredStartDate ? new Date(formData.preferredStartDate) : null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Training Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Training Topic *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Digital Marketing Strategy"
                required
                data-testid="input-training-title"
              />
            </div>
            <div>
              <Label htmlFor="trainingType">Training Type *</Label>
              <Select
                value={formData.trainingType}
                onValueChange={(value) => setFormData({ ...formData, trainingType: value })}
              >
                <SelectTrigger data-testid="select-training-type">
                  <SelectValue placeholder="Select training type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate Workshop">Corporate Workshop</SelectItem>
                  <SelectItem value="Team Training">Team Training</SelectItem>
                  <SelectItem value="Leadership Development">Leadership Development</SelectItem>
                  <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                  <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  <SelectItem value="Compliance Training">Compliance Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="minBudget">Minimum Budget (per hour) *</Label>
              <Input
                id="minBudget"
                type="number"
                min="0"
                step="0.01"
                value={formData.minBudget}
                onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                placeholder="50"
                required
                data-testid="input-min-budget"
              />
            </div>
            <div>
              <Label htmlFor="maxBudget">Maximum Budget (per hour) *</Label>
              <Input
                id="maxBudget"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxBudget}
                onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                placeholder="200"
                required
                data-testid="input-max-budget"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 2 days, 8 hours total"
                data-testid="input-duration"
              />
            </div>
            <div>
              <Label htmlFor="preferredStartDate">Preferred Start Date</Label>
              <Input
                id="preferredStartDate"
                type="date"
                value={formData.preferredStartDate}
                onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })}
                data-testid="input-start-date"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRemote"
              checked={formData.isRemote}
              onCheckedChange={(checked) => setFormData({ ...formData, isRemote: checked as boolean })}
              data-testid="checkbox-remote"
            />
            <Label htmlFor="isRemote">Remote training acceptable</Label>
          </div>

          {!formData.isRemote && (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State or specific address"
                data-testid="input-location"
              />
            </div>
          )}

          <div>
            <Label htmlFor="description">Requirements Description *</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your specific training needs, audience, and objectives..."
              required
              data-testid="textarea-description"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRequestMutation.isPending}
              data-testid="button-submit"
            >
              {createRequestMutation.isPending ? "Posting..." : "Post Request & Find Instructors"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
