CREATE TABLE `containerTrackingEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`containerId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`location` varchar(255),
	`vessel` varchar(255),
	`description` text,
	`eventDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `containerTrackingEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `containers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`containerNumber` varchar(100) NOT NULL,
	`sealNumber` varchar(100),
	`containerType` varchar(50) NOT NULL,
	`shippingLine` varchar(255) NOT NULL,
	`vesselName` varchar(255),
	`voyageNumber` varchar(100),
	`portOfLoading` varchar(255) NOT NULL,
	`portOfDischarge` varchar(255) NOT NULL,
	`estimatedDeparture` timestamp,
	`estimatedArrival` timestamp,
	`actualDeparture` timestamp,
	`actualArrival` timestamp,
	`status` enum('booked','loaded','in_transit','arrived','customs_clearance','released','delivered') NOT NULL DEFAULT 'booked',
	`cargoDescription` text,
	`totalValue` int,
	`totalWeight` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `containers_id` PRIMARY KEY(`id`),
	CONSTRAINT `containers_containerNumber_unique` UNIQUE(`containerNumber`)
);
