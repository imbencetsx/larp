ALTER TABLE `larp_progress` ADD `growth` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `larp_progress` SET `growth` = 100 WHERE `completedAt` IS NOT NULL;
