CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`oldValue` text,
	`newValue` text,
	`description` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chart_of_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountCode` varchar(20) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`accountType` enum('asset','liability','equity','revenue','expense') NOT NULL,
	`mainCategory` varchar(100) NOT NULL,
	`subCategory` varchar(100),
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`parentAccountId` int,
	`openingBalance` decimal(15,3) DEFAULT '0',
	`currentBalance` decimal(15,3) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chart_of_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `chart_of_accounts_accountCode_unique` UNIQUE(`accountCode`)
);
--> statement-breakpoint
CREATE TABLE `financial_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportType` enum('balance_sheet','income_statement','cash_flow','trial_balance','general_ledger') NOT NULL,
	`reportName` varchar(255) NOT NULL,
	`reportDate` date NOT NULL,
	`reportPeriod` varchar(50) NOT NULL,
	`reportContent` text,
	`totalAssets` decimal(15,3),
	`totalLiabilities` decimal(15,3),
	`totalEquity` decimal(15,3),
	`totalRevenue` decimal(15,3),
	`totalExpenses` decimal(15,3),
	`netIncome` decimal(15,3),
	`status` enum('draft','finalized') NOT NULL DEFAULT 'draft',
	`generatedBy` int NOT NULL,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `general_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int NOT NULL,
	`transactionId` int NOT NULL,
	`entryDate` date NOT NULL,
	`description` text,
	`debitAmount` decimal(15,3) DEFAULT '0',
	`creditAmount` decimal(15,3) DEFAULT '0',
	`runningBalance` decimal(15,3) NOT NULL,
	`reference` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `general_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`declarationId` int,
	`invoiceId` int,
	`transactionNumber` varchar(50) NOT NULL,
	`transactionDate` date NOT NULL,
	`transactionType` enum('purchase','sale','expense','revenue','adjustment','transfer') NOT NULL,
	`debitAccountId` int NOT NULL,
	`creditAccountId` int NOT NULL,
	`amount` decimal(15,3) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'JOD',
	`description` text,
	`reference` varchar(100),
	`notes` text,
	`status` enum('pending','approved','posted','reversed') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionNumber_unique` UNIQUE(`transactionNumber`)
);
--> statement-breakpoint
CREATE TABLE `trial_balance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balanceDate` date NOT NULL,
	`balancePeriod` varchar(50) NOT NULL,
	`accountId` int NOT NULL,
	`accountCode` varchar(20) NOT NULL,
	`accountName` varchar(255) NOT NULL,
	`debitBalance` decimal(15,3) DEFAULT '0',
	`creditBalance` decimal(15,3) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trial_balance_id` PRIMARY KEY(`id`)
);
