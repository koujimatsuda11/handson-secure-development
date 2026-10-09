import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../errors/AuthorizationError';
import { logger } from '../helpers/logger';

/**
 * 必要なスコープが含まれているかチェックするミドルウェア
 */
export const requireScope = (requiredScope: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 認証済みのリクエストかチェック
      if (!req.user) {
        logger.warn('スコープチェック: ユーザーが認証されていません');
        throw new AuthorizationError('認証が必要です');
      }

      // アクセストークンからスコープを取得
      // Cognitoのアクセストークンには'scope'クレームが含まれる
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        logger.warn('スコープチェック: アクセストークンが見つかりません');
        throw new AuthorizationError('アクセストークンが必要です');
      }

      // JWTのペイロードを取得（Base64デコード）
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const scopes: string = payload.scope || '';
      const scopeArray = scopes.split(' ').filter(s => s.length > 0);

      logger.info({
        user_id: req.user.id,
        required_scope: requiredScope,
        user_scopes: scopeArray,
        request_uri: req.originalUrl,
        request_method: req.method
      }, 'スコープチェック実行');

      // 必要なスコープが含まれているかチェック
      if (!scopeArray.includes(requiredScope)) {
        logger.warn({
          user_id: req.user.id,
          required_scope: requiredScope,
          user_scopes: scopeArray,
          request_uri: req.originalUrl,
          request_method: req.method
        }, 'スコープチェック失敗: 必要なスコープが不足');
        
        throw new AuthorizationError(`必要なスコープが不足しています: ${requiredScope}`);
      }

      logger.info({
        user_id: req.user.id,
        required_scope: requiredScope,
        request_uri: req.originalUrl,
        request_method: req.method
      }, 'スコープチェック成功');

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 複数のスコープのうちいずれかが含まれているかチェックするミドルウェア
 */
export const requireAnyScope = (requiredScopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 認証済みのリクエストかチェック
      if (!req.user) {
        logger.warn('スコープチェック: ユーザーが認証されていません');
        throw new AuthorizationError('認証が必要です');
      }

      // アクセストークンからスコープを取得
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        logger.warn('スコープチェック: アクセストークンが見つかりません');
        throw new AuthorizationError('アクセストークンが必要です');
      }

      // JWTのペイロードを取得（Base64デコード）
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const scopes: string = payload.scope || '';
      const scopeArray = scopes.split(' ').filter(s => s.length > 0);

      logger.info({
        user_id: req.user.id,
        required_scopes: requiredScopes,
        user_scopes: scopeArray,
        request_uri: req.originalUrl,
        request_method: req.method
      }, 'スコープチェック実行（いずれか）');

      // いずれかのスコープが含まれているかチェック
      const hasRequiredScope = requiredScopes.some(scope => scopeArray.includes(scope));
      
      if (!hasRequiredScope) {
        logger.warn({
          user_id: req.user.id,
          required_scopes: requiredScopes,
          user_scopes: scopeArray,
          request_uri: req.originalUrl,
          request_method: req.method
        }, 'スコープチェック失敗: 必要なスコープがいずれも不足');
        
        throw new AuthorizationError(`必要なスコープが不足しています: ${requiredScopes.join(', ')}`);
      }

      logger.info({
        user_id: req.user.id,
        matched_scopes: requiredScopes.filter(scope => scopeArray.includes(scope)),
        request_uri: req.originalUrl,
        request_method: req.method
      }, 'スコープチェック成功（いずれか）');

      next();
    } catch (error) {
      next(error);
    }
  };
};