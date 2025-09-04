import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);

  const handleGetStarted = (userType: string) => {
    // In a real app, this would redirect to the appropriate registration flow
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <i className="fas fa-graduation-cap text-primary text-2xl mr-3"></i>
                <span className="font-bold text-xl text-foreground">InstructorMatch</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Find Instructors</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Become Instructor</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">How it Works</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = "/api/login"}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary transition-colors font-medium"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Connect with Expert Instructors
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto">
            Find verified professional instructors for corporate training, skill development, and educational programs. Secure matching with transparent pricing.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Company Registration */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-8">
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-building text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">For Companies</h3>
              <p className="mb-6 opacity-90">Post your training needs and get matched with verified instructors</p>
              <Button 
                onClick={() => handleGetStarted('company')}
                className="w-full bg-white text-primary font-semibold py-3 px-6 rounded-lg hover:bg-white/90 transition-colors"
                data-testid="button-company-signup"
              >
                Find Instructors
              </Button>
            </Card>

            {/* Instructor Registration */}
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-8">
              <div className="bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chalkboard-teacher text-2xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">For Instructors</h3>
              <p className="mb-6 opacity-90">Join our verified network and get hired by top companies</p>
              <Button 
                onClick={() => handleGetStarted('instructor')}
                className="w-full bg-accent text-accent-foreground font-semibold py-3 px-6 rounded-lg hover:bg-accent/90 transition-colors"
                data-testid="button-instructor-signup"
              >
                Become Instructor
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How InstructorMatch Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process ensures quality matches and successful training outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Post Requirements</h3>
              <p className="text-muted-foreground">Companies describe their training needs, budget, and timeline</p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-accent-foreground font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
              <p className="text-muted-foreground">Our algorithm matches with verified instructors within budget range</p>
            </div>

            <div className="text-center">
              <div className="bg-chart-2 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Review & Select</h3>
              <p className="text-muted-foreground">Browse instructor profiles, ratings, and portfolios</p>
            </div>

            <div className="text-center">
              <div className="verification-badge w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Training</h3>
              <p className="text-muted-foreground">E-contract and escrow payment ensure quality delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Instructors */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Instructors</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Meet our top-rated, verified instructors trusted by leading companies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 card-hover">
              <div className="w-20 h-20 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-user text-2xl text-muted-foreground"></i>
              </div>
              
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold">Dr. Emily Zhang</h3>
                  <div className="verification-badge px-2 py-1 rounded-full text-xs text-white font-medium">
                    <i className="fas fa-check mr-1"></i>Verified
                  </div>
                </div>
                <p className="text-muted-foreground">Digital Marketing Strategy</p>
              </div>
              
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-1"></i>
                  <span>4.9</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">200+ sessions</span>
              </div>
              
              <p className="text-center text-muted-foreground mb-6">
                Former Google marketing executive with expertise in data-driven strategies and digital transformation.
              </p>
              
              <div className="text-center mb-4">
                <span className="text-2xl font-bold text-primary">$150/hr</span>
              </div>
              
              <Button className="w-full" data-testid="button-view-profile">
                View Profile
              </Button>
            </Card>

            <Card className="p-6 card-hover">
              <div className="w-20 h-20 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-user text-2xl text-muted-foreground"></i>
              </div>
              
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold">James Peterson</h3>
                  <div className="verification-badge px-2 py-1 rounded-full text-xs text-white font-medium">
                    <i className="fas fa-check mr-1"></i>Verified
                  </div>
                </div>
                <p className="text-muted-foreground">Leadership Development</p>
              </div>
              
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-1"></i>
                  <span>4.8</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">180+ sessions</span>
              </div>
              
              <p className="text-center text-muted-foreground mb-6">
                Harvard MBA and former Fortune 500 executive specializing in transformational leadership programs.
              </p>
              
              <div className="text-center mb-4">
                <span className="text-2xl font-bold text-primary">$200/hr</span>
              </div>
              
              <Button className="w-full" data-testid="button-view-profile">
                View Profile
              </Button>
            </Card>

            <Card className="p-6 card-hover">
              <div className="w-20 h-20 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-user text-2xl text-muted-foreground"></i>
              </div>
              
              <div className="text-center mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold">Priya Sharma</h3>
                  <div className="verification-badge px-2 py-1 rounded-full text-xs text-white font-medium">
                    <i className="fas fa-check mr-1"></i>Verified
                  </div>
                </div>
                <p className="text-muted-foreground">Software Development</p>
              </div>
              
              <div className="flex justify-center items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-1"></i>
                  <span>4.9</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">150+ sessions</span>
              </div>
              
              <p className="text-center text-muted-foreground mb-6">
                Senior engineer from Apple with 12+ years experience in mobile and web development training.
              </p>
              
              <div className="text-center mb-4">
                <span className="text-2xl font-bold text-primary">$180/hr</span>
              </div>
              
              <Button className="w-full" data-testid="button-view-profile">
                View Profile
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Companies Trust InstructorMatch</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive verification and secure payment system ensures quality outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="verification-badge w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Verified Instructors</h3>
              <p className="text-muted-foreground">
                Rigorous background checks, education verification, and reference validation for every instructor
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-2xl text-primary-foreground"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Payments are held in escrow and released only after successful completion of training sessions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-contract text-2xl text-accent-foreground"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">E-Contracts</h3>
              <p className="text-muted-foreground">
                Digital contracts with clear terms, deliverables, and satisfaction guarantees for peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <i className="fas fa-graduation-cap text-primary text-2xl mr-3"></i>
                <span className="font-bold text-xl">InstructorMatch</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Connecting companies with verified professional instructors for quality training outcomes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Companies</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Find Instructors</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Post Requirements</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Enterprise Solutions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Instructors</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Join as Instructor</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Verification Process</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Instructor Resources</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 InstructorMatch. All rights reserved. | Contact: hr@squarelight.ai</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
