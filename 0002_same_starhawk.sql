CREATE TABLE `careerPaths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`title` varchar(160) NOT NULL,
	`description` text NOT NULL,
	`accent` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `careerPaths_id` PRIMARY KEY(`id`),
	CONSTRAINT `careerPaths_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `interviews` ADD `careerPathId` int;--> statement-breakpoint
ALTER TABLE `interviews` ADD CONSTRAINT `interviews_careerPathId_careerPaths_id_fk` FOREIGN KEY (`careerPathId`) REFERENCES `careerPaths`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `interviews_career_path_idx` ON `interviews` (`careerPathId`);