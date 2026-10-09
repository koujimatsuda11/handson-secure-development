import { MigrationInterface, QueryRunner } from "typeorm";

export class All1754611403916 implements MigrationInterface {
    name = 'All1754611403916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`content\` varchar(255) NOT NULL COMMENT '投稿内容', \`type\` enum ('post') NOT NULL COMMENT '投稿タイプ' DEFAULT 'post', \`posted_at\` datetime(6) NOT NULL COMMENT '投稿日時' DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`cognito_sub\` varchar(128) NULL COMMENT 'Cognito sub (UUID)', \`email\` varchar(255) NULL COMMENT 'メールアドレス', \`profile\` varchar(1024) NULL COMMENT 'プロフィール', \`registered_at\` datetime(6) NOT NULL COMMENT 'ユーザ登録日時' DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_1ac76d6d17ea198c621bdc4e29\` (\`cognito_sub\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ae05faaa55c866130abef6e1fee\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ae05faaa55c866130abef6e1fee\``);
        await queryRunner.query(`DROP INDEX \`IDX_1ac76d6d17ea198c621bdc4e29\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
    }

}
