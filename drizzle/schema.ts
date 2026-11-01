import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 220 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "member", "admin"]).default("member").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 220 }).notNull(),
  address: text("address"),
  timezone: varchar("timezone", { length: 80 }),
  phone: varchar("phone", { length: 40 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const onboardingSubmissions = mysqlTable("onboarding_submissions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  step: int("step").default(0).notNull(),
  status: mysqlEnum("status", ["incomplete", "awaiting_review", "configuration_in_progress", "awaiting_customer_approval", "ready_for_deployment", "live", "paused", "cancelled"]).default("incomplete").notNull(),
  payload: text("payload").notNull(),
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const approvedConfigurations = mysqlTable("approved_configurations", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  version: int("version").default(1).notNull(),
  payload: text("payload").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const proposedChanges = mysqlTable("proposed_changes", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  requestedBy: int("requestedBy").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "awaiting_customer_information", "approved", "in_progress", "testing", "completed", "rejected"]).default("draft").notNull(),
  administratorResponse: text("administratorResponse"),
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  completionDate: timestamp("completionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  providerName: varchar("providerName", { length: 120 }),
  providerAgentId: varchar("providerAgentId", { length: 180 }),
  status: mysqlEnum("status", ["not_started", "configuring", "testing", "awaiting_approval", "ready_for_deployment", "live", "paused", "cancelled"]).default("not_started").notNull(),
  internalNotes: text("internalNotes"),
  goLiveAt: timestamp("goLiveAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deploymentTasks = mysqlTable("deployment_tasks", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  agentId: int("agentId"),
  taskKey: varchar("taskKey", { length: 120 }).notNull(),
  label: varchar("label", { length: 240 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const testScenarios = mysqlTable("test_scenarios", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  prompt: text("prompt").notNull(),
  result: text("result"),
  status: mysqlEnum("status", ["pending", "passed", "needs_correction", "not_started"]).default("not_started").notNull(),
  testedAt: timestamp("testedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const callRecords = mysqlTable("call_records", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  providerCallId: varchar("providerCallId", { length: 180 }),
  occurredAt: timestamp("occurredAt"),
  durationSeconds: int("durationSeconds"),
  outcome: varchar("outcome", { length: 160 }),
  leadPayload: text("leadPayload"),
  summary: text("summary"),
  transcript: text("transcript"),
  retentionUntil: timestamp("retentionUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  createdBy: int("createdBy").notNull(),
  subject: varchar("subject", { length: 240 }).notNull(),
  category: varchar("category", { length: 120 }),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  status: mysqlEnum("status", ["open", "waiting_on_customer", "in_progress", "resolved", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const supportReplies = mysqlTable("support_replies", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  authorId: int("authorId").notNull(),
  body: text("body").notNull(),
  internal: boolean("internal").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  planKey: varchar("planKey", { length: 80 }).notNull(),
  billingInterval: mysqlEnum("billingInterval", ["monthly", "annual"]).default("monthly").notNull(),
  status: mysqlEnum("status", ["awaiting_payment", "active", "paused", "cancellation_requested", "cancelled"]).default("awaiting_payment").notNull(),
  providerSubscriptionId: varchar("providerSubscriptionId", { length: 180 }),
  nextBillingAt: timestamp("nextBillingAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  providerInvoiceId: varchar("providerInvoiceId", { length: 180 }),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 80 }),
  invoiceUrl: text("invoiceUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  category: varchar("category", { length: 120 }),
  authorName: varchar("authorName", { length: 160 }),
  seoTitle: varchar("seoTitle", { length: 240 }),
  metaDescription: text("metaDescription"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "unpublished"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const helpArticlesDb = mysqlTable("help_articles", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 120 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const emailNotifications = mysqlTable("email_notifications", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"),
  eventKey: varchar("eventKey", { length: 120 }).notNull(),
  recipient: varchar("recipient", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["queued", "sent", "failed", "unconfigured"]).default("unconfigured").notNull(),
  providerMessageId: varchar("providerMessageId", { length: 180 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId"),
  actorId: int("actorId"),
  action: varchar("action", { length: 180 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type OnboardingSubmission = typeof onboardingSubmissions.$inferSelect;
export type ProposedChange = typeof proposedChanges.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;


export const demoRequests = mysqlTable("demo_requests", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["new", "under_review", "needs_information", "demo_approved", "proposal_sent", "converted", "declined", "archived"]).default("new").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  role: varchar("role", { length: 120 }),
  businessName: varchar("businessName", { length: 220 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  industry: varchar("industry", { length: 120 }),
  website: varchar("website", { length: 320 }),
  serviceArea: text("serviceArea"),
  hours: varchar("hours", { length: 220 }),
  callVolume: varchar("callVolume", { length: 100 }),
  services: text("services"),
  planInterest: varchar("planInterest", { length: 120 }),
  phoneSetup: varchar("phoneSetup", { length: 160 }),
  callTasks: text("callTasks"),
  faqs: text("faqs"),
  goals: text("goals"),
  specialNotes: text("specialNotes"),
  preferredReviewTime: varchar("preferredReviewTime", { length: 180 }),
  contactConsent: boolean("contactConsent").default(false).notNull(),
  privacyNoticeVersion: varchar("privacyNoticeVersion", { length: 80 }).notNull(),
  ownerNotes: text("ownerNotes"),
  paymentLink: text("paymentLink"),
  paymentLinkSentAt: timestamp("paymentLinkSentAt"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const legalConsents = mysqlTable("legal_consents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  organizationId: int("organizationId"),
  demoRequestId: int("demoRequestId"),
  consentType: varchar("consentType", { length: 100 }).notNull(),
  documentKey: varchar("documentKey", { length: 120 }).notNull(),
  documentVersion: varchar("documentVersion", { length: 80 }).notNull(),
  documentHash: varchar("documentHash", { length: 128 }),
  accepted: boolean("accepted").notNull(),
  source: varchar("source", { length: 80 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
});

export const consentPreferences = mysqlTable("consent_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }),
  essential: boolean("essential").default(true).notNull(),
  analytics: boolean("analytics").default(false).notNull(),
  marketing: boolean("marketing").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
