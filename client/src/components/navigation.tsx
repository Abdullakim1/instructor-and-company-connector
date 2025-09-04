import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center"
              data-testid="button-home"
            >
              <i className="fas fa-graduation-cap text-primary text-2xl mr-3"></i>
              <span className="font-bold text-xl text-foreground">InstructorMatch</span>
            </button>
            {isAuthenticated && (
              <div className="hidden md:flex space-x-6">
                {user?.userType === "company" && (
                  <button
                    onClick={() => setLocation("/company-dashboard")}
                    className={`transition-colors ${
                      location === "/company-dashboard"
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    data-testid="button-company-dashboard"
                  >
                    Dashboard
                  </button>
                )}
                {user?.userType === "instructor" && (
                  <>
                    <button
                      onClick={() => setLocation("/instructor-dashboard")}
                      className={`transition-colors ${
                        location === "/instructor-dashboard"
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      data-testid="button-instructor-dashboard"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => setLocation("/instructor-profile")}
                      className={`transition-colors ${
                        location === "/instructor-profile"
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      data-testid="button-instructor-profile"
                    >
                      Profile
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => window.location.href = "/api/login"}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="button-sign-in"
                >
                  Sign In
                </button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} alt={user?.firstName || "User"} />
                      <AvatarFallback>
                        {(user?.firstName?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLocation("/")}
                    data-testid="button-dashboard"
                  >
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Dashboard
                  </DropdownMenuItem>
                  {user?.userType === "instructor" && (
                    <DropdownMenuItem
                      onClick={() => setLocation("/instructor-profile")}
                      data-testid="button-profile"
                    >
                      <i className="fas fa-user mr-2"></i>
                      Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
