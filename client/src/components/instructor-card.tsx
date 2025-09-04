import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface InstructorCardProps {
  instructor: {
    id: string;
    professionalTitle: string;
    minHourlyRate: string;
    desiredHourlyRate: string;
    rating: string;
    completedSessions: number;
    bio: string;
    specializations: string[];
    isVerified: boolean;
    user: {
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  };
  onSelect?: (instructorId: string) => void;
  showSelectButton?: boolean;
}

export default function InstructorCard({ instructor, onSelect, showSelectButton = false }: InstructorCardProps) {
  const fullName = `${instructor.user.firstName} ${instructor.user.lastName}`;
  const initials = `${instructor.user.firstName[0]}${instructor.user.lastName[0]}`.toUpperCase();

  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={instructor.user.profileImageUrl} alt={fullName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-xl font-semibold" data-testid={`text-instructor-name-${instructor.id}`}>
                  {fullName}
                </h4>
                {instructor.isVerified && (
                  <Badge className="verification-badge">
                    <i className="fas fa-check mr-1"></i>Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2" data-testid={`text-instructor-title-${instructor.id}`}>
                {instructor.professionalTitle}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-1"></i>
                  <span data-testid={`text-instructor-rating-${instructor.id}`}>
                    {parseFloat(instructor.rating).toFixed(1)}
                  </span>
                </span>
                <span className="flex items-center">
                  <i className="fas fa-clock text-muted-foreground mr-1"></i>
                  <span data-testid={`text-instructor-sessions-${instructor.id}`}>
                    {instructor.completedSessions} sessions completed
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary mb-1" data-testid={`text-instructor-rate-${instructor.id}`}>
              ${instructor.desiredHourlyRate}/hr
            </div>
            <div className="text-sm text-muted-foreground">
              Min: ${instructor.minHourlyRate}/hr
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-muted-foreground mb-4" data-testid={`text-instructor-bio-${instructor.id}`}>
            {instructor.bio}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {instructor.specializations?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm" data-testid={`button-view-profile-${instructor.id}`}>
                View Profile
              </Button>
              {showSelectButton && onSelect && (
                <Button 
                  onClick={() => onSelect(instructor.id)}
                  size="sm"
                  data-testid={`button-select-instructor-${instructor.id}`}
                >
                  Select Instructor
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
