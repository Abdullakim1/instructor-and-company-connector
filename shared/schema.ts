import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: pgEnum("user_type", ["company", "instructor"])("user_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company profiles
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("company_name").notNull(),
  industry: varchar("industry"),
  companySize: varchar("company_size"),
  description: text("description"),
  website: varchar("website"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Instructor profiles
export const instructors = pgTable("instructors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  professionalTitle: varchar("professional_title").notNull(),
  yearsExperience: integer("years_experience").notNull(),
  location: varchar("location"),
  bio: text("bio"),
  specializations: text("specializations").array(),
  minHourlyRate: decimal("min_hourly_rate", { precision: 10, scale: 2 }).notNull(),
  desiredHourlyRate: decimal("desired_hourly_rate", { precision: 10, scale: 2 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationStatus: pgEnum("verification_status", ["pending", "approved", "rejected"])("verification_status").default("pending"),
  verificationDocuments: text("verification_documents").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  completedSessions: integer("completed_sessions").default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training requests from companies
export const trainingRequests = pgTable("training_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  trainingType: varchar("training_type").notNull(),
  duration: varchar("duration").notNull(),
  minBudget: decimal("min_budget", { precision: 10, scale: 2 }).notNull(),
  maxBudget: decimal("max_budget", { precision: 10, scale: 2 }).notNull(),
  location: varchar("location"),
  isRemote: boolean("is_remote").default(false),
  preferredStartDate: timestamp("preferred_start_date"),
  status: pgEnum("request_status", ["open", "in_progress", "completed", "cancelled"])("request_status").default("open"),
  selectedInstructorId: varchar("selected_instructor_id").references(() => instructors.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Instructor applications to training requests
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => trainingRequests.id, { onDelete: "cascade" }),
  instructorId: varchar("instructor_id").notNull().references(() => instructors.id, { onDelete: "cascade" }),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }).notNull(),
  coverLetter: text("cover_letter"),
  status: pgEnum("application_status", ["pending", "accepted", "rejected"])("application_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts between companies and instructors
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => trainingRequests.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  instructorId: varchar("instructor_id").notNull().references(() => instructors.id),
  agreedRate: decimal("agreed_rate", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  terms: text("terms"),
  status: pgEnum("contract_status", ["draft", "signed", "completed", "disputed"])("contract_status").default("draft"),
  signedAt: timestamp("signed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Escrow payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).notNull(),
  instructorAmount: decimal("instructor_amount", { precision: 10, scale: 2 }).notNull(),
  status: pgEnum("payment_status", ["held_in_escrow", "released", "refunded", "disputed"])("payment_status").default("held_in_escrow"),
  paidAt: timestamp("paid_at"),
  releasedAt: timestamp("released_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").notNull().references(() => contracts.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 scale
  comment: text("comment"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // 'email', 'sms', 'push'
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  instructor: one(instructors, {
    fields: [users.id],
    references: [instructors.userId],
  }),
  notifications: many(notifications),
  reviewsGiven: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  trainingRequests: many(trainingRequests),
  contracts: many(contracts),
}));

export const instructorsRelations = relations(instructors, ({ one, many }) => ({
  user: one(users, {
    fields: [instructors.userId],
    references: [users.id],
  }),
  applications: many(applications),
  contracts: many(contracts),
}));

export const trainingRequestsRelations = relations(trainingRequests, ({ one, many }) => ({
  company: one(companies, {
    fields: [trainingRequests.companyId],
    references: [companies.id],
  }),
  selectedInstructor: one(instructors, {
    fields: [trainingRequests.selectedInstructorId],
    references: [instructors.id],
  }),
  applications: many(applications),
  contracts: many(contracts),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  request: one(trainingRequests, {
    fields: [applications.requestId],
    references: [trainingRequests.id],
  }),
  instructor: one(instructors, {
    fields: [applications.instructorId],
    references: [instructors.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  request: one(trainingRequests, {
    fields: [contracts.requestId],
    references: [trainingRequests.id],
  }),
  company: one(companies, {
    fields: [contracts.companyId],
    references: [companies.id],
  }),
  instructor: one(instructors, {
    fields: [contracts.instructorId],
    references: [instructors.id],
  }),
  payments: many(payments),
  reviews: many(reviews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  contract: one(contracts, {
    fields: [reviews.contractId],
    references: [contracts.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewee",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  userType: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  completedSessions: true,
  totalEarnings: true,
});

export const insertTrainingRequestSchema = createInsertSchema(trainingRequests).omit({
  id: true,
  status: true,
  selectedInstructorId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type TrainingRequest = typeof trainingRequests.$inferSelect;
export type InsertTrainingRequest = z.infer<typeof insertTrainingRequestSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Contract = typeof contracts.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Notification = typeof notifications.$inferSelect;
