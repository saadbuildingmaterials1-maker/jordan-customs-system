ALTER TABLE `customs_declarations` ADD `barcodeNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `egyptianReferenceNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `importerLicenseNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `importerTaxNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `importerSequentialNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `importerName` varchar(200);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `exporterLicenseNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `exporterName` varchar(200);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `certificateNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `transactionNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `volumeCbm` decimal(10,3);--> statement-breakpoint
ALTER TABLE `customs_declarations` ADD `customsCode` varchar(50);--> statement-breakpoint
ALTER TABLE `items` ADD `customsCode` varchar(50);--> statement-breakpoint
ALTER TABLE `items` ADD `itemNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `items` ADD `description` text;