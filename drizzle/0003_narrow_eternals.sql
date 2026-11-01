ALTER TABLE `demo_requests` ADD `role` varchar(120);--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `hours` varchar(220);--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `services` text;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `planInterest` varchar(120);--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `phoneSetup` varchar(160);--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `callTasks` text;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `faqs` text;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `specialNotes` text;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `ownerNotes` text;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `paymentLink` text;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `paymentLinkSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `demo_requests` ADD `approvedAt` timestamp;