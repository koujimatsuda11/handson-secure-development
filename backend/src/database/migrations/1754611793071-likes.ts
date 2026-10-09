import { MigrationInterface, QueryRunner } from "typeorm";

export class Likes1754611793071 implements MigrationInterface {
    name = 'Likes1754611793071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`posts_users_users\` (\`postsId\` int NOT NULL, \`usersId\` int NOT NULL, INDEX \`IDX_dc17d6a0d3e6969076195a0ac6\` (\`postsId\`), INDEX \`IDX_a719cd3ead249ea1f288b7e3aa\` (\`usersId\`), PRIMARY KEY (\`postsId\`, \`usersId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`posts_users_users\` ADD CONSTRAINT \`FK_dc17d6a0d3e6969076195a0ac63\` FOREIGN KEY (\`postsId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`posts_users_users\` ADD CONSTRAINT \`FK_a719cd3ead249ea1f288b7e3aa5\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts_users_users\` DROP FOREIGN KEY \`FK_a719cd3ead249ea1f288b7e3aa5\``);
        await queryRunner.query(`ALTER TABLE \`posts_users_users\` DROP FOREIGN KEY \`FK_dc17d6a0d3e6969076195a0ac63\``);
        await queryRunner.query(`DROP INDEX \`IDX_a719cd3ead249ea1f288b7e3aa\` ON \`posts_users_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_dc17d6a0d3e6969076195a0ac6\` ON \`posts_users_users\``);
        await queryRunner.query(`DROP TABLE \`posts_users_users\``);
    }

}
