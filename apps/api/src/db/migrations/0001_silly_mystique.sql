CREATE TABLE `addresses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`label` text DEFAULT 'Casa' NOT NULL,
	`cep` text NOT NULL,
	`street` text NOT NULL,
	`number` text NOT NULL,
	`complement` text,
	`neighborhood` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refresh_tokens_token_hash_unique` ON `refresh_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `orders` ADD `user_id` integer REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_cep` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_street` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_number` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_complement` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_neighborhood` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_address_id` integer REFERENCES addresses(id);