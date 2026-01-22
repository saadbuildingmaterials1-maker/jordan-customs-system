CREATE TABLE `account_operation_mapping` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operation_type` enum('import','export','local_sale','local_purchase','payment','receipt','expense','customs_clearance','freight','insurance','other') NOT NULL,
	`operation_step` varchar(100) NOT NULL,
	`debit_account_id` int,
	`credit_account_id` int,
	`description` text,
	`is_automatic` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `account_operation_mapping_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `general_journal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`journal_date` timestamp NOT NULL,
	`journal_number` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`reference_type` enum('invoice','customs_declaration','payment','expense','transfer','adjustment','other') NOT NULL,
	`reference_id` int,
	`reference_number` varchar(100),
	`debit_account_id` int NOT NULL,
	`credit_account_id` int NOT NULL,
	`amount` decimal(15,3) NOT NULL,
	`currency` enum('JOD','USD','EUR','AED') DEFAULT 'JOD',
	`exchange_rate` decimal(10,6) DEFAULT '1',
	`amount_jod` decimal(15,3) NOT NULL,
	`status` enum('draft','posted','reversed') DEFAULT 'draft',
	`approved_by` int,
	`approved_at` timestamp,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `general_journal_id` PRIMARY KEY(`id`),
	CONSTRAINT `general_journal_journal_number_unique` UNIQUE(`journal_number`)
);
--> statement-breakpoint
CREATE TABLE `period_balances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_id` int NOT NULL,
	`period_year` int NOT NULL,
	`period_month` int NOT NULL,
	`opening_balance` decimal(15,3) DEFAULT '0',
	`debit_amount` decimal(15,3) DEFAULT '0',
	`credit_amount` decimal(15,3) DEFAULT '0',
	`closing_balance` decimal(15,3) NOT NULL,
	`currency` enum('JOD','USD','EUR','AED') DEFAULT 'JOD',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `period_balances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `operation_type_idx` ON `account_operation_mapping` (`operation_type`);--> statement-breakpoint
CREATE INDEX `journal_date_idx` ON `general_journal` (`journal_date`);--> statement-breakpoint
CREATE INDEX `debit_account_idx` ON `general_journal` (`debit_account_id`);--> statement-breakpoint
CREATE INDEX `credit_account_idx` ON `general_journal` (`credit_account_id`);--> statement-breakpoint
CREATE INDEX `reference_idx` ON `general_journal` (`reference_type`,`reference_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `general_journal` (`status`);--> statement-breakpoint
CREATE INDEX `account_period_idx` ON `period_balances` (`account_id`,`period_year`,`period_month`);