CREATE TABLE `interviewAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`interviewId` int NOT NULL,
	`sequence` int NOT NULL,
	`question` text NOT NULL,
	`category` enum('general','technical','behavioral') NOT NULL,
	`answer` text,
	`score` int,
	`clarityScore` int,
	`relevanceScore` int,
	`structureScore` int,
	`feedback` text,
	`improvement` text,
	`answeredAt` timestamp,
	CONSTRAINT `interviewAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleTitle` varchar(200) NOT NULL,
	`experienceLevel` enum('graduate','junior','mid','senior') NOT NULL,
	`focus` enum('balanced','technical','behavioral') NOT NULL DEFAULT 'balanced',
	`status` enum('in_progress','completed') NOT NULL DEFAULT 'in_progress',
	`currentQuestion` int NOT NULL DEFAULT 1,
	`overallScore` int,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `interviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `interviewAnswers` ADD CONSTRAINT `interviewAnswers_interviewId_interviews_id_fk` FOREIGN KEY (`interviewId`) REFERENCES `interviews`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interviews` ADD CONSTRAINT `interviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `answers_interview_sequence_idx` ON `interviewAnswers` (`interviewId`,`sequence`);--> statement-breakpoint
CREATE INDEX `interviews_user_created_idx` ON `interviews` (`userId`,`createdAt`);