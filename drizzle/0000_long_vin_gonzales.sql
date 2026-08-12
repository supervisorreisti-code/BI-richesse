CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuario` varchar(255),
	`tabela` varchar(64) NOT NULL,
	`registro` varchar(255),
	`campo` varchar(64),
	`valor_antigo` text,
	`valor_novo` text,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lojas_periodos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`periodo` varchar(32) NOT NULL,
	`loja` varchar(128) NOT NULL,
	`vendas_total` int NOT NULL,
	`meta` int NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lojas_periodos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ranking_vendedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`periodo` varchar(32) NOT NULL,
	`loja` varchar(128) NOT NULL,
	`posicao` int NOT NULL,
	`vendedor` varchar(128) NOT NULL,
	`vendas` int NOT NULL,
	`is_deleted` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ranking_vendedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
