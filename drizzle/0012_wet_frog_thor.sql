CREATE TABLE `analytics_dashboard` (
	`id` text NOT NULL,
	`user_id` text NOT NULL,
	`dashboard_name` text NOT NULL,
	`dashboard_config` text,
	`is_default` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_dashboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text NOT NULL,
	`user_id` text,
	`event_type` text NOT NULL,
	`event_name` text NOT NULL,
	`event_data` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analytics_metrics` (
	`id` text NOT NULL,
	`metric_type` text NOT NULL,
	`metric_name` text NOT NULL,
	`metric_value` real NOT NULL,
	`metric_unit` text,
	`period` text NOT NULL,
	`period_date` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analytics_dashboard` ADD CONSTRAINT `analytics_dashboard_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;