import express from 'express';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/global/errorHandler';
import { routes } from './routes';

export const app = express();

// ヘルスチェックエンドポイント（CORS制御対象外）
app.get('/health-check', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// CORS設定不要：全環境で同一オリジン構成
// - 開発環境: Viteプロキシで同一オリジン  
// - 本番環境: CloudFrontで同一オリジン

app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({extended: true,limit: process.env.REQUEST_LIMIT || '100kb',type: 'application/x-www-form-urlencoded'}));
app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '50mb' }));

routes(app);

app.use(errorHandler);