CREATE TABLE `backup_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`criado_em` timestamp NOT NULL DEFAULT (now()),
	`usuario` varchar(255),
	`tipo` varchar(32) NOT NULL DEFAULT 'manual',
	`storage_key` varchar(255) NOT NULL,
	`descricao` varchar(255),
	`registros_lojas` int NOT NULL DEFAULT 0,
	`registros_ranking` int NOT NULL DEFAULT 0,
	CONSTRAINT `backup_snapshots_id` PRIMARY KEY(`id`)
);
