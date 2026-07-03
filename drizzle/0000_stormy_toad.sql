CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '',
	`done` integer DEFAULT false,
	`completed_at` integer,
	`created_at` integer
);
