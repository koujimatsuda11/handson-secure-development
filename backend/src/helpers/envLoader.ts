import dotenv from 'dotenv';
import path from 'path';

// 環境に応じた設定ファイルを読み込み
const env = process.env.NODE_ENV || 'development';

// .env.localファイルがあれば優先的に読み込み
dotenv.config({
  path: path.join(__dirname, '../../.env.local'),
});

// 環境別の設定ファイルも読み込み
dotenv.config({
  path: path.join(__dirname, `../../.env.${env}`),
});
