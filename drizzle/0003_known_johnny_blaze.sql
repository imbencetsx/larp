CREATE TABLE `larp_enrollment` (
	`userId` text NOT NULL,
	`trackId` text NOT NULL,
	`experience` text,
	`source` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`userId`, `trackId`),
	FOREIGN KEY (`userId`) REFERENCES `larp_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `larp_enrollment` (`userId`, `trackId`, `source`)
SELECT `id`, `learningTrack`, 'onboarding' FROM `larp_user`
WHERE `onboardingCompletedAt` IS NOT NULL
AND `learningTrack` IN ('html', 'css', 'javascript', 'typescript', 'nextjs');
