ALTER TABLE `analytics_dashboard` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_events` MODIFY COLUMN `id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `analytics_metrics` MODIFY COLUMN `id` varchar(36) NOT NULL;