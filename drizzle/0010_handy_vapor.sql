CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`ibanEncrypted` text NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`swiftCode` varchar(20),
	`accountType` enum('checking','savings','business') DEFAULT 'checking',
	`currency` varchar(3) DEFAULT 'JOD',
	`isDefault` boolean DEFAULT false,
	`isVerified` boolean DEFAULT false,
	`verificationCode` varchar(10),
	`verificationAttempts` int DEFAULT 0,
	`stripeAccountId` varchar(255),
	`status` enum('pending','verified','active','inactive','suspended') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankAccountId` int NOT NULL,
	`transactionId` varchar(255) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'JOD',
	`type` enum('deposit','withdrawal','transfer','payment','refund') NOT NULL,
	`status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
	`description` text,
	`reference` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `bank_transactions_transactionId_unique` UNIQUE(`transactionId`)
);
--> statement-breakpoint
CREATE TABLE `bank_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankAccountId` int NOT NULL,
	`verificationMethod` enum('micro_deposit','document','api','manual') NOT NULL,
	`status` enum('pending','verified','failed','expired') DEFAULT 'pending',
	`verificationCode` varchar(10),
	`attempts` int DEFAULT 0,
	`maxAttempts` int DEFAULT 3,
	`expiresAt` timestamp,
	`verifiedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bank_accounts` ADD CONSTRAINT `bank_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bank_transactions` ADD CONSTRAINT `bank_transactions_bankAccountId_bank_accounts_id_fk` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_accounts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bank_verifications` ADD CONSTRAINT `bank_verifications_bankAccountId_bank_accounts_id_fk` FOREIGN KEY (`bankAccountId`) REFERENCES `bank_accounts`(`id`) ON DELETE no action ON UPDATE no action;