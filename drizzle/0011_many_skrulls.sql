CREATE TABLE `bank_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('account_added','account_verified','transaction_completed','transaction_failed','verification_required','security_alert','account_suspended','payment_received','payment_sent') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` boolean DEFAULT false,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`channels` varchar(255) DEFAULT 'email,in_app',
	`sentAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationId` int NOT NULL,
	`channel` enum('email','sms','push','in_app') NOT NULL,
	`status` enum('pending','sent','failed','bounced') DEFAULT 'pending',
	`recipient` varchar(255) NOT NULL,
	`sentAt` timestamp,
	`failureReason` text,
	`retryCount` int DEFAULT 0,
	`maxRetries` int DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean DEFAULT true,
	`smsNotifications` boolean DEFAULT false,
	`pushNotifications` boolean DEFAULT true,
	`inAppNotifications` boolean DEFAULT true,
	`accountAddedNotification` boolean DEFAULT true,
	`accountVerifiedNotification` boolean DEFAULT true,
	`transactionNotification` boolean DEFAULT true,
	`securityAlertNotification` boolean DEFAULT true,
	`dailyDigest` boolean DEFAULT false,
	`weeklyReport` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `bank_notifications` ADD CONSTRAINT `bank_notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_log` ADD CONSTRAINT `notification_log_notificationId_bank_notifications_id_fk` FOREIGN KEY (`notificationId`) REFERENCES `bank_notifications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;