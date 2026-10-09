import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserNickname1796538600000 implements MigrationInterface {
    name = 'AddUserNickname1796538600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`nickname\` varchar(255) NULL COMMENT 'ニックネーム'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
    }

}
