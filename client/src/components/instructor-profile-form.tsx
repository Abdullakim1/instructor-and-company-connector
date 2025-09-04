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
import { Badge } from "@/components/ui/badge";

interface InstructorProfileFormProps {
  initialData?: any;
  onSuccess: () => void;
}

const SPECIALIZATIONS = [
  "Digital Marketing",
  "Leadership Development", 
  "Software Development",
  "Project Management",
  "Data Analytics",
  "Sales Training",
  "Customer Service",
  "Finance & Accounting",
  "HR & Recruiting",
  "Operations Management",
  "Public Speaking",
  "Team Building",
  "Change Management",
  "Strategic Planning",
  "Quality Assurance",
  "Cybersecurity",
  "Cloud Computing",
  "Artificial Intelligence",
  "Business Intelligence",
  "Compliance Training"
];

export default function InstructorProfileForm({ initialData, onSuccess }: InstructorProfileFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    professionalTitle: initialData?.professionalTitle || "",
    yearsExperience: initialData?.yearsExperience || "",
    location: initialData?.location || "",
    bio: initialData?.bio || "",
    specializations: initialData?.specializations || [],
    minHourlyRate: initialData?.minHourlyRate || "",
    desiredHourlyRate: initialData?.desiredHourlyRate || "",
  });

  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(
    initialData?.specializations || []
  );

  const createInstructorMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = initialData ? `/api/instructors/${initialData.id}` : "/api/instructors";
      const method = initialData ? "PUT" : "POST";
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved",
        description: initialData 
          ? "Your instructor profile has been updated successfully." 
          : "Your instructor profile has been created and submitted for verification.",
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
        description: "Failed to save instructor profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSpecializationToggle = (specialization: string) => {
    setSelectedSpecializations(prev => 
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.professionalTitle || !formData.yearsExperience || !formData.minHourlyRate || !formData.desiredHourlyRate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(formData.minHourlyRate) >= parseFloat(formData.desiredHourlyRate)) {
      toast({
        title: "Validation Error", 
        description: "Desired hourly rate must be greater than minimum hourly rate.",
        variant: "destructive",
      });
      return;
    }

    if (selectedSpecializations.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one specialization.",
        variant: "destructive",
      });
      return;
    }

    createInstructorMutation.mutate({
      ...formData,
      specializations: selectedSpecializations,
      yearsExperience: parseInt(formData.yearsExperience),
      minHourlyRate: parseFloat(formData.minHourlyRate),
      desiredHourlyRate: parseFloat(formData.desiredHourlyRate),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Update Your Profile" : "Create Your Instructor Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="professionalTitle">Professional Title *</Label>
                <Input
                  id="professionalTitle"
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                  placeholder="e.g., Digital Marketing Expert"
                  required
                  data-testid="input-professional-title"
                />
              </div>
              <div>
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <Select
                  value={formData.yearsExperience}
                  onValueChange={(value) => setFormData({ ...formData, yearsExperience: value })}
                >
                  <SelectTrigger data-testid="select-years-experience">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1-2 years</SelectItem>
                    <SelectItem value="3">3-5 years</SelectItem>
                    <SelectItem value="6">6-10 years</SelectItem>
                    <SelectItem value="11">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, State"
                  data-testid="input-location"
                />
              </div>
            </div>
          </div>

          {/* Rate Setting */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Rate Setting</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="minHourlyRate">Minimum Hourly Rate *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="minHourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minHourlyRate}
                    onChange={(e) => setFormData({ ...formData, minHourlyRate: e.target.value })}
                    className="pl-8"
                    placeholder="50"
                    required
                    data-testid="input-min-rate"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="desiredHourlyRate">Desired Hourly Rate *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="desiredHourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.desiredHourlyRate}
                    onChange={(e) => setFormData({ ...formData, desiredHourlyRate: e.target.value })}
                    className="pl-8"
                    placeholder="120"
                    required
                    data-testid="input-desired-rate"
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Companies will see offers within your rate range. Higher rates require stronger verification.
            </p>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Specializations *</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select all areas where you have expertise and can provide training.
            </p>
            <div className="grid md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {SPECIALIZATIONS.map((specialization) => (
                <label
                  key={specialization}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSpecializations.includes(specialization)}
                    onCheckedChange={() => handleSpecializationToggle(specialization)}
                    data-testid={`checkbox-specialization-${specialization.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <span>{specialization}</span>
                </label>
              ))}
            </div>
            {selectedSpecializations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSpecializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleSpecializationToggle(spec)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verification Documents */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Verification Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your credentials to get verified and increase your visibility to companies.
            </p>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <i className="fas fa-upload text-3xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-2">Upload Education Certificates</p>
                <p className="text-xs text-muted-foreground mb-4">PDF, JPG, PNG formats accepted</p>
                <Button 
                  type="button" 
                  variant="outline"
                  data-testid="button-upload-education"
                >
                  <i className="fas fa-file-upload mr-2"></i>
                  Choose Files
                </Button>
              </div>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <i className="fas fa-upload text-3xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground mb-2">Upload Professional References</p>
                <p className="text-xs text-muted-foreground mb-4">Letters of recommendation, client testimonials</p>
                <Button 
                  type="button" 
                  variant="outline"
                  data-testid="button-upload-references"
                >
                  <i className="fas fa-file-upload mr-2"></i>
                  Choose Files
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex">
                <i className="fas fa-info-circle text-blue-500 mr-3 mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Verification Process</h4>
                  <p className="text-sm text-blue-700">
                    Our verification team reviews all documents within 2-3 business days. Verified instructors receive priority in search results and can charge higher rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Professional Bio *</h3>
            <Textarea
              rows={6}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Describe your experience, teaching style, and what makes you unique as an instructor. Include your background, notable achievements, and approach to training..."
              required
              data-testid="textarea-bio"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {formData.bio.length}/1000 characters. A compelling bio helps companies understand your expertise.
            </p>
          </div>

          {/* Verification Status Display */}
          {initialData && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Verification Status</h3>
              <div className="flex items-center space-x-4 p-4 border border-border rounded-lg">
                {initialData.isVerified ? (
                  <>
                    <div className="verification-badge w-12 h-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-lg"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">Verified Instructor</p>
                      <p className="text-sm text-muted-foreground">
                        You're verified and can receive premium opportunities
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center">
                      <i className="fas fa-clock text-yellow-600 text-lg"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-700">Verification Pending</p>
                      <p className="text-sm text-muted-foreground">
                        Upload your documents above to start the verification process
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createInstructorMutation.isPending}
              data-testid="button-submit"
            >
              {createInstructorMutation.isPending 
                ? "Saving..." 
                : initialData 
                  ? "Update Profile"
                  : "Submit for Verification"
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
