import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCompanySchema,
  insertInstructorSchema,
  insertTrainingRequestSchema,
  insertApplicationSchema,
  insertReviewSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get additional profile data based on user type
      let profile = null;
      if (user.userType === 'company') {
        profile = await storage.getCompanyByUserId(userId);
      } else if (user.userType === 'instructor') {
        profile = await storage.getInstructorByUserId(userId);
      }

      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Company routes
  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company profile" });
    }
  });

  app.put('/api/companies/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertCompanySchema.partial().parse(req.body);
      
      const company = await storage.updateCompany(id, updates);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company profile" });
    }
  });

  // Instructor routes
  app.post('/api/instructors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const instructorData = insertInstructorSchema.parse({ ...req.body, userId });
      
      const instructor = await storage.createInstructor(instructorData);
      res.json(instructor);
    } catch (error) {
      console.error("Error creating instructor:", error);
      res.status(500).json({ message: "Failed to create instructor profile" });
    }
  });

  app.put('/api/instructors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertInstructorSchema.partial().parse(req.body);
      
      const instructor = await storage.updateInstructor(id, updates);
      res.json(instructor);
    } catch (error) {
      console.error("Error updating instructor:", error);
      res.status(500).json({ message: "Failed to update instructor profile" });
    }
  });

  app.get('/api/instructors/search', async (req, res) => {
    try {
      const { minBudget, maxBudget } = req.query;
      
      if (!minBudget || !maxBudget) {
        return res.status(400).json({ message: "Budget range required" });
      }

      const instructors = await storage.getInstructorsInBudgetRange(
        Number(minBudget),
        Number(maxBudget)
      );
      res.json(instructors);
    } catch (error) {
      console.error("Error searching instructors:", error);
      res.status(500).json({ message: "Failed to search instructors" });
    }
  });

  // Training request routes
  app.post('/api/training-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompanyByUserId(userId);
      
      if (!company) {
        return res.status(400).json({ message: "Company profile required" });
      }

      const requestData = insertTrainingRequestSchema.parse({ 
        ...req.body, 
        companyId: company.id 
      });
      
      const request = await storage.createTrainingRequest(requestData);
      
      // Create notification for matched instructors
      const instructors = await storage.getInstructorsInBudgetRange(
        Number(requestData.minBudget),
        Number(requestData.maxBudget)
      );

      for (const instructor of instructors) {
        await storage.createNotification({
          userId: instructor.userId,
          title: "New Training Opportunity",
          message: `A new training request for "${requestData.title}" matches your rate range.`,
          type: "email",
          isRead: false,
          sentAt: new Date(),
        });
      }

      res.json(request);
    } catch (error) {
      console.error("Error creating training request:", error);
      res.status(500).json({ message: "Failed to create training request" });
    }
  });

  app.get('/api/training-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userType = req.query.type;

      if (userType === 'company') {
        const company = await storage.getCompanyByUserId(userId);
        if (!company) {
          return res.json([]);
        }
        const requests = await storage.getTrainingRequestsByCompany(company.id);
        res.json(requests);
      } else {
        // For instructors, show all open requests
        const requests = await storage.getOpenTrainingRequests();
        res.json(requests);
      }
    } catch (error) {
      console.error("Error fetching training requests:", error);
      res.status(500).json({ message: "Failed to fetch training requests" });
    }
  });

  app.put('/api/training-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const request = await storage.updateTrainingRequest(id, updates);
      res.json(request);
    } catch (error) {
      console.error("Error updating training request:", error);
      res.status(500).json({ message: "Failed to update training request" });
    }
  });

  // Application routes
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const instructor = await storage.getInstructorByUserId(userId);
      
      if (!instructor) {
        return res.status(400).json({ message: "Instructor profile required" });
      }

      const applicationData = insertApplicationSchema.parse({ 
        ...req.body, 
        instructorId: instructor.id 
      });
      
      const application = await storage.createApplication(applicationData);
      
      // Create notification for company
      const request = await storage.getTrainingRequestsByCompany(req.body.companyId);
      if (request.length > 0) {
        await storage.createNotification({
          userId: request[0].companyId, // This should be the company user ID
          title: "New Application Received",
          message: `An instructor has applied for your training request: "${request[0].title}"`,
          type: "email",
          isRead: false,
          sentAt: new Date(),
        });
      }

      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const { requestId, instructorId } = req.query;

      if (requestId) {
        const applications = await storage.getApplicationsByRequest(requestId as string);
        res.json(applications);
      } else if (instructorId) {
        const applications = await storage.getApplicationsByInstructor(instructorId as string);
        res.json(applications);
      } else {
        res.status(400).json({ message: "requestId or instructorId required" });
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const application = await storage.updateApplication(id, updates);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Contract routes
  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const contractData = req.body;
      const contract = await storage.createContract(contractData);
      
      // Create escrow payment
      const serviceFeeRate = 0.1; // 10% service fee
      const serviceFee = contractData.totalAmount * serviceFeeRate;
      const instructorAmount = contractData.totalAmount - serviceFee;

      // In a real implementation, this would integrate with a payment processor
      // For now, we'll simulate the escrow
      
      res.json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ 
        ...req.body, 
        reviewerId: userId 
      });
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/instructor/:instructorId', async (req, res) => {
    try {
      const { instructorId } = req.params;
      const reviews = await storage.getReviewsByInstructor(instructorId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // User type setup route
  app.put('/api/user/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userType } = req.body;

      if (!['company', 'instructor'].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const user = await storage.upsertUser({
        id: userId,
        email: req.user.claims.email,
        firstName: req.user.claims.first_name,
        lastName: req.user.claims.last_name,
        profileImageUrl: req.user.claims.profile_image_url,
        userType,
      });

      res.json(user);
    } catch (error) {
      console.error("Error setting up user:", error);
      res.status(500).json({ message: "Failed to setup user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
