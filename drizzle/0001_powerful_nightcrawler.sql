CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`providerName` varchar(120),
	`providerAgentId` varchar(180),
	`status` enum('not_started','configuring','testing','awaiting_approval','ready_for_deployment','live','paused','cancelled') NOT NULL DEFAULT 'not_started',
	`internalNotes` text,
	`goLiveAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approved_configurations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`version` int NOT NULL DEFAULT 1,
	`payload` text NOT NULL,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approved_configurations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`actorId` int,
	`action` varchar(180) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(220) NOT NULL,
	`title` varchar(240) NOT NULL,
	`excerpt` text,
	`body` text NOT NULL,
	`category` varchar(120),
	`authorName` varchar(160),
	`seoTitle` varchar(240),
	`metaDescription` text,
	`status` enum('draft','scheduled','published','unpublished') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `call_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`providerCallId` varchar(180),
	`occurredAt` timestamp,
	`durationSeconds` int,
	`outcome` varchar(160),
	`leadPayload` text,
	`summary` text,
	`transcript` text,
	`retentionUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `call_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deployment_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`agentId` int,
	`taskKey` varchar(120) NOT NULL,
	`label` varchar(240) NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`notes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deployment_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`eventKey` varchar(120) NOT NULL,
	`recipient` varchar(320) NOT NULL,
	`status` enum('queued','sent','failed','unconfigured') NOT NULL DEFAULT 'unconfigured',
	`providerMessageId` varchar(180),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `help_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(120) NOT NULL,
	`title` varchar(240) NOT NULL,
	`body` text NOT NULL,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `help_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`providerInvoiceId` varchar(180),
	`amount` decimal(10,2),
	`status` varchar(80),
	`invoiceUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(220) NOT NULL,
	`address` text,
	`timezone` varchar(80),
	`phone` varchar(40),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','member','admin') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`step` int NOT NULL DEFAULT 0,
	`status` enum('incomplete','awaiting_review','configuration_in_progress','awaiting_customer_approval','ready_for_deployment','live','paused','cancelled') NOT NULL DEFAULT 'incomplete',
	`payload` text NOT NULL,
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(220) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `proposed_changes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`requestedBy` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`status` enum('draft','submitted','under_review','awaiting_customer_information','approved','in_progress','testing','completed','rejected') NOT NULL DEFAULT 'draft',
	`administratorResponse` text,
	`approvalStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`completionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposed_changes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`planKey` varchar(80) NOT NULL,
	`billingInterval` enum('monthly','annual') NOT NULL DEFAULT 'monthly',
	`status` enum('awaiting_payment','active','paused','cancellation_requested','cancelled') NOT NULL DEFAULT 'awaiting_payment',
	`providerSubscriptionId` varchar(180),
	`nextBillingAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`authorId` int NOT NULL,
	`body` text NOT NULL,
	`internal` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `support_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`createdBy` int NOT NULL,
	`subject` varchar(240) NOT NULL,
	`category` varchar(120),
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`status` enum('open','waiting_on_customer','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`prompt` text NOT NULL,
	`result` text,
	`status` enum('pending','passed','needs_correction','not_started') NOT NULL DEFAULT 'not_started',
	`testedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_scenarios_id` PRIMARY KEY(`id`)
);
