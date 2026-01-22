CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('success','error','warning','info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`operationType` varchar(100),
	`relatedEntityType` varchar(100),
	`relatedEntityId` int,
	`metadata` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
