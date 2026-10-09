import path from 'path';
import { DataSource } from 'typeorm'
import '../helpers/envLoader';
import fs from 'fs';

const isDevelopment = process.env.NODE_ENV !== 'production';

// SSL/TLS設定
const getSslConfig = () => {
  // 本番環境でのみSSL/TLS接続を有効化
  if (!isDevelopment) {
    const caPath = process.env.DB_SSL_CA || '/app/rds-ca-bundle.pem';

    // 証明書ファイルが存在する場合は、完全な証明書検証を行う
    if (fs.existsSync(caPath)) {
      return {
        rejectUnauthorized: true,
        ca: fs.readFileSync(caPath).toString(),
      };
    }

    // 証明書ファイルが見つからない場合は、暗号化のみ（検証なし）
    console.warn('RDS CA certificate not found. SSL/TLS encryption enabled but certificate verification disabled.');
    return {
      rejectUnauthorized: false,
    };
  }

  // 開発環境ではSSL/TLSを無効化
  return false;
};

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || process.env.MYSQL_SERVER,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306),
  username: process.env.DB_USERNAME || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE,
  ssl: getSslConfig(),
  synchronize: false,
  logging: false,
  entities: isDevelopment
    ? [path.join(__dirname, '../entities/*.ts')]
    : [path.join(__dirname, '../../dist/entities/*.js')],
  migrations: isDevelopment
    ? [path.join(__dirname, './migrations/*.ts')]
    : [path.join(__dirname, '../../dist/database/migrations/*.js')],
  subscribers: [],
  charset: 'utf8mb4',
});
