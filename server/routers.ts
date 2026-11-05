import { COOKIE_NAME } from "@shared/const";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { demoRequests, legalConsents, memberships, onboardingSubmissions, organizations, proposedChanges, supportTickets, trustLabSubmissions, users } from "../drizzle/schema";

async function getOrCreateOrganization(user: { id: number; name: string | null; openId: string }, businessName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const existing = await db.select({ organizationId: memberships.organizationId }).from(memberships).where(eq(memberships.userId, user.id)).limit(1);
  if (existing[0]?.organizationId) return existing[0].organizationId;
  const name = businessName?.trim() || `${user.name || "My"} business`;
  const result = await db.insert(organizations).values({ name, slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "business"}-${nanoid(6).toLowerCase()}` });
  const organizationId = Number(result[0].insertId);
  await db.insert(memberships).values({ organizationId, userId: user.id, role: "owner" });
  return organizationId;
}

async function getOrganizationId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select({ organizationId: memberships.organizationId }).from(memberships).where(eq(memberships.userId, userId)).limit(1);
  return result[0]?.organizationId ?? null;
}

export const appRouter = router({
  system: systemRouter,
  publicIntake: router({
    trustLab: router({
      wall: publicProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select({ id: trustLabSubmissions.id, kind: trustLabSubmissions.kind, title: trustLabSubmissions.title, body: trustLabSubmissions.body, displayName: trustLabSubmissions.displayName, industry: trustLabSubmissions.industry, createdAt: trustLabSubmissions.createdAt }).from(trustLabSubmissions).where(eq(trustLabSubmissions.status, "approved")).orderBy(desc(trustLabSubmissions.createdAt)).limit(30);
      }),
      submit: publicProcedure.input(z.object({ kind: z.enum(["challenge", "question", "stress_test"]), title: z.string().trim().max(180).optional(), body: z.string().trim().min(8).max(3000), displayName: z.string().trim().max(80).optional(), industry: z.string().trim().max(120).optional(), impactScore: z.number().int().min(0).max(100).optional(), website: z.string().max(200).optional() })).mutation(async ({ input }) => {
        if (input.website) return { created: true, status: "pending" as const };
        const db = await getDb();
        if (!db) return { created: false, reason: "database_unavailable" as const };
        await db.insert(trustLabSubmissions).values({ kind: input.kind, title: input.title || null, body: input.body, displayName: input.displayName || "Anonymous", industry: input.industry || null, impactScore: input.impactScore ?? null, status: "pending" });
        return { created: true, status: "pending" as const };
      }),
    }),
    demoRequest: publicProcedure.input(z.object({
      name: z.string().trim().min(2).max(180),
      role: z.string().max(120).optional(),
      businessName: z.string().trim().min(2).max(220),
      email: z.string().email().max(320),
      phone: z.string().trim().max(40).optional(),
      industry: z.string().max(120).optional(),
      website: z.string().url().max(320).optional().or(z.literal("")),
      serviceArea: z.string().max(5000).optional(),
      hours: z.string().max(220).optional(),
      callVolume: z.string().max(100).optional(),
      services: z.string().max(5000).optional(),
      planInterest: z.string().max(120).optional(),
      phoneSetup: z.string().max(160).optional(),
      callTasks: z.string().max(5000).optional(),
      faqs: z.string().max(5000).optional(),
      goals: z.string().max(5000).optional(),
      specialNotes: z.string().max(5000).optional(),
      preferredReviewTime: z.string().max(180).optional(),
      contactConsent: z.literal(true),
      privacyNoticeVersion: z.string().min(1).max(80),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { created: false, reason: "database_unavailable" as const };
      const result = await db.insert(demoRequests).values(input);
      const demoRequestId = Number(result[0].insertId);
      await db.insert(legalConsents).values({ demoRequestId, consentType: "contact", documentKey: "privacy", documentVersion: input.privacyNoticeVersion, accepted: true, source: "demo_request", ipAddress: ctx.req.ip, userAgent: ctx.req.get("user-agent") });
      return { created: true, demoRequestId };
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  portal: router({
    consents: router({
      record: protectedProcedure.input(z.object({ consents: z.array(z.object({ consentType: z.string().min(1).max(100), documentKey: z.string().min(1).max(120), documentVersion: z.string().min(1).max(80), documentHash: z.string().max(128).optional(), accepted: z.literal(true), source: z.string().min(1).max(80) })).min(1) })).mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { recorded: false, reason: "database_unavailable" as const };
        const organizationId = await getOrganizationId(ctx.user.id);
        await db.insert(legalConsents).values(input.consents.map(consent => ({ ...consent, userId: ctx.user.id, organizationId, ipAddress: ctx.req.ip, userAgent: ctx.req.get("user-agent") })));
        return { recorded: true, count: input.consents.length };
      }),
    }),
    onboarding: router({
      latest: protectedProcedure.query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return null;
        const organizationId = await getOrganizationId(ctx.user.id);
        if (!organizationId) return null;
        const result = await db.select().from(onboardingSubmissions).where(eq(onboardingSubmissions.organizationId, organizationId)).orderBy(desc(onboardingSubmissions.updatedAt)).limit(1);
        return result[0] ?? null;
      }),
      saveDraft: protectedProcedure.input(z.object({ step: z.number().int().min(0).max(9), payload: z.record(z.string(), z.unknown()), businessName: z.string().trim().max(220).optional() })).mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { saved: false, reason: "database_unavailable" as const };
        const organizationId = await getOrCreateOrganization(ctx.user, input.businessName);
        await db.insert(onboardingSubmissions).values({ organizationId, step: input.step, status: "incomplete", payload: JSON.stringify(input.payload) });
        return { saved: true, organizationId };
      }),
      submit: protectedProcedure.input(z.object({ payload: z.record(z.string(), z.unknown()), businessName: z.string().trim().min(1).max(220) })).mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { submitted: false, reason: "database_unavailable" as const };
        const organizationId = await getOrCreateOrganization(ctx.user, input.businessName);
        await db.insert(onboardingSubmissions).values({ organizationId, step: 9, status: "awaiting_review", payload: JSON.stringify(input.payload), submittedAt: new Date() });
        return { submitted: true, status: "awaiting_review" as const };
      }),
    }),
    changes: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const organizationId = await getOrganizationId(ctx.user.id);
        if (!organizationId) return [];
        return db.select().from(proposedChanges).where(eq(proposedChanges.organizationId, organizationId)).orderBy(desc(proposedChanges.createdAt));
      }),
      create: protectedProcedure.input(z.object({ title: z.string().trim().min(3).max(240), description: z.string().trim().min(5).max(5000) })).mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { created: false, reason: "database_unavailable" as const };
        const organizationId = await getOrganizationId(ctx.user.id);
        if (!organizationId) return { created: false, reason: "organization_missing" as const };
        await db.insert(proposedChanges).values({ organizationId, requestedBy: ctx.user.id, title: input.title, description: input.description, status: "submitted" });
        return { created: true, status: "submitted" as const };
      }),
    }),
    support: router({
      createTicket: protectedProcedure.input(z.object({ subject: z.string().trim().min(3).max(240), category: z.string().max(120).optional(), priority: z.enum(["low", "normal", "high", "urgent"]).default("normal") })).mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { created: false, reason: "database_unavailable" as const };
        const organizationId = await getOrganizationId(ctx.user.id);
        if (!organizationId) return { created: false, reason: "organization_missing" as const };
        await db.insert(supportTickets).values({ organizationId, createdBy: ctx.user.id, subject: input.subject, category: input.category, priority: input.priority });
        return { created: true };
      }),
    }),
  }),
  admin: router({
    trustLab: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(trustLabSubmissions).orderBy(desc(trustLabSubmissions.createdAt)).limit(200);
      }),
      moderate: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected", "pending"]) })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { updated: false, reason: "database_unavailable" as const };
        await db.update(trustLabSubmissions).set({ status: input.status, reviewedAt: new Date() }).where(eq(trustLabSubmissions.id, input.id));
        return { updated: true };
      }),
    }),
    demoRequests: router({
      list: adminProcedure.query(async () => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt));
      }),
      update: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "under_review", "needs_information", "demo_approved", "proposal_sent", "converted", "declined", "archived"]).optional(), ownerNotes: z.string().max(10000).optional(), paymentLink: z.string().url().max(2000).optional() })).mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { updated: false, reason: "database_unavailable" as const };
        const { id, ...changes } = input;
        await db.update(demoRequests).set({ ...changes, approvedAt: input.status === "demo_approved" ? new Date() : undefined, paymentLinkSentAt: input.paymentLink ? new Date() : undefined }).where(eq(demoRequests.id, id));
        return { updated: true };
      }),
    }),
    overview: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { configured: false, organizations: 0, awaitingReview: 0, openTickets: 0 };
      const orgs = await db.select({ id: organizations.id }).from(organizations);
      const submissions = await db.select({ id: onboardingSubmissions.id }).from(onboardingSubmissions).where(eq(onboardingSubmissions.status, "awaiting_review"));
      const tickets = await db.select({ id: supportTickets.id }).from(supportTickets).where(and(eq(supportTickets.status, "open")));
      return { configured: true, organizations: orgs.length, awaitingReview: submissions.length, openTickets: tickets.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
