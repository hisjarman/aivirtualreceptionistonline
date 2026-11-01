CREATE TABLE `consent_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320),
	`essential` boolean NOT NULL DEFAULT true,
	`analytics` boolean NOT NULL DEFAULT false,
	`marketing` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consent_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `demo_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`status` enum('new','under_review','needs_information','qualified','proposal_sent','converted','declined','archived') NOT NULL DEFAULT 'new',
	`name` varchar(180) NOT NULL,
	`businessName` varchar(220) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(40),
	`industry` varchar(120),
	`website` varchar(320),
	`serviceArea` text,
	`callVolume` varchar(100),
	`goals` text,
	`preferredReviewTime` varchar(180),
	`contactConsent` boolean NOT NULL DEFAULT false,
	`privacyNoticeVersion` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demo_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legal_consents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`organizationId` int,
	`demoRequestId` int,
	`consentType` varchar(100) NOT NULL,
	`documentKey` varchar(120) NOT NULL,
	`documentVersion` varchar(80) NOT NULL,
	`documentHash` varchar(128),
	`accepted` boolean NOT NULL,
	`source` varchar(80) NOT NULL,
	`ipAddress` varchar(64),
	`userAgent` varchar(512),
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_consents_id` PRIMARY KEY(`id`)
);
