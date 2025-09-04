import {
  users,
  companies,
  instructors,
  trainingRequests,
  applications,
  contracts,
  payments,
  reviews,
  notifications,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Instructor,
  type InsertInstructor,
  type TrainingRequest,
  type InsertTrainingRequest,
  type Application,
  type InsertApplication,
  type Contract,
  type Payment,
  type Review,
  type InsertReview,
  type Notification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanyByUserId(userId: string): Promise<Company | undefined>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company>;
  
  // Instructor operations
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  getInstructorByUserId(userId: string): Promise<Instructor | undefined>;
  updateInstructor(id: string, updates: Partial<InsertInstructor>): Promise<Instructor>;
  getInstructorsInBudgetRange(minBudget: number, maxBudget: number): Promise<Instructor[]>;
  
  // Training request operations
  createTrainingRequest(request: InsertTrainingRequest): Promise<TrainingRequest>;
  getTrainingRequestsByCompany(companyId: string): Promise<TrainingRequest[]>;
  getOpenTrainingRequests(): Promise<TrainingRequest[]>;
  updateTrainingRequest(id: string, updates: Partial<TrainingRequest>): Promise<TrainingRequest>;
  
  // Application operations
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByRequest(requestId: string): Promise<(Application & { instructor: Instructor })[]>;
  getApplicationsByInstructor(instructorId: string): Promise<(Application & { request: TrainingRequest })[]>;
  updateApplication(id: string, updates: Partial<Application>): Promise<Application>;
  
  // Contract operations
  createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract>;
  getContractsByCompany(companyId: string): Promise<Contract[]>;
  getContractsByInstructor(instructorId: string): Promise<Contract[]>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByInstructor(instructorId: string): Promise<Review[]>;
  
  // Notification operations
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompanyByUserId(userId: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  // Instructor operations
  async createInstructor(instructor: InsertInstructor): Promise<Instructor> {
    const [newInstructor] = await db.insert(instructors).values(instructor).returning();
    return newInstructor;
  }

  async getInstructorByUserId(userId: string): Promise<Instructor | undefined> {
    const [instructor] = await db.select().from(instructors).where(eq(instructors.userId, userId));
    return instructor;
  }

  async updateInstructor(id: string, updates: Partial<InsertInstructor>): Promise<Instructor> {
    const [instructor] = await db
      .update(instructors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(instructors.id, id))
      .returning();
    return instructor;
  }

  async getInstructorsInBudgetRange(minBudget: number, maxBudget: number): Promise<Instructor[]> {
    return await db
      .select()
      .from(instructors)
      .where(
        and(
          eq(instructors.isVerified, true),
          lte(instructors.minHourlyRate, maxBudget.toString()),
          gte(instructors.desiredHourlyRate, minBudget.toString())
        )
      )
      .orderBy(desc(instructors.rating));
  }

  // Training request operations
  async createTrainingRequest(request: InsertTrainingRequest): Promise<TrainingRequest> {
    const [newRequest] = await db.insert(trainingRequests).values(request).returning();
    return newRequest;
  }

  async getTrainingRequestsByCompany(companyId: string): Promise<TrainingRequest[]> {
    return await db
      .select()
      .from(trainingRequests)
      .where(eq(trainingRequests.companyId, companyId))
      .orderBy(desc(trainingRequests.createdAt));
  }

  async getOpenTrainingRequests(): Promise<TrainingRequest[]> {
    return await db
      .select()
      .from(trainingRequests)
      .where(eq(trainingRequests.status, "open"))
      .orderBy(desc(trainingRequests.createdAt));
  }

  async updateTrainingRequest(id: string, updates: Partial<TrainingRequest>): Promise<TrainingRequest> {
    const [request] = await db
      .update(trainingRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trainingRequests.id, id))
      .returning();
    return request;
  }

  // Application operations
  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async getApplicationsByRequest(requestId: string): Promise<(Application & { instructor: Instructor })[]> {
    const results = await db
      .select()
      .from(applications)
      .innerJoin(instructors, eq(applications.instructorId, instructors.id))
      .where(eq(applications.requestId, requestId))
      .orderBy(desc(applications.createdAt));
    
    return results.map(result => ({
      ...result.applications,
      instructor: result.instructors
    }));
  }

  async getApplicationsByInstructor(instructorId: string): Promise<(Application & { request: TrainingRequest })[]> {
    const results = await db
      .select()
      .from(applications)
      .innerJoin(trainingRequests, eq(applications.requestId, trainingRequests.id))
      .where(eq(applications.instructorId, instructorId))
      .orderBy(desc(applications.createdAt));
    
    return results.map(result => ({
      ...result.applications,
      request: result.training_requests
    }));
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const [application] = await db
      .update(applications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  // Contract operations
  async createContract(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    return newContract;
  }

  async getContractsByCompany(companyId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.companyId, companyId))
      .orderBy(desc(contracts.createdAt));
  }

  async getContractsByInstructor(instructorId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.instructorId, instructorId))
      .orderBy(desc(contracts.createdAt));
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update instructor rating
    if (review.revieweeId) {
      const instructor = await db.select().from(instructors).where(eq(instructors.userId, review.revieweeId));
      if (instructor.length > 0) {
        const allReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.revieweeId, review.revieweeId));
        
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        await db
          .update(instructors)
          .set({ rating: avgRating.toFixed(2) })
          .where(eq(instructors.userId, review.revieweeId));
      }
    }
    
    return newReview;
  }

  async getReviewsByInstructor(instructorId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.revieweeId, instructorId))
      .orderBy(desc(reviews.createdAt));
  }

  // Notification operations
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
}

export const storage = new DatabaseStorage();
