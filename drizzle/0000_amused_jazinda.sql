CREATE TABLE `larp_attempt` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`lessonId` text NOT NULL,
	`code` text NOT NULL,
	`passed` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `larp_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lessonId`) REFERENCES `larp_lesson`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `attempt_user_idx` ON `larp_attempt` (`userId`);--> statement-breakpoint
CREATE TABLE `larp_course` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `larp_lesson` (
	`id` text PRIMARY KEY NOT NULL,
	`courseId` text NOT NULL,
	`title` text NOT NULL,
	`position` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`courseId`) REFERENCES `larp_course`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `larp_post` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `larp_progress` (
	`userId` text NOT NULL,
	`lessonId` text NOT NULL,
	`code` text DEFAULT '' NOT NULL,
	`completedAt` integer,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`userId`, `lessonId`),
	FOREIGN KEY (`userId`) REFERENCES `larp_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lessonId`) REFERENCES `larp_lesson`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `larp_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Learner' NOT NULL,
	`plantName` text DEFAULT 'Sprout' NOT NULL,
	`dailyGoal` integer DEFAULT 1 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
