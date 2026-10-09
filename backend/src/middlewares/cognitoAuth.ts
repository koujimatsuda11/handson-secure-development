import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { logger } from '../helpers/logger';
import { AuthenticationError } from '../errors/AuthenticationError';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { User } from '../entities/User';

// Cognito JWT verifierのインスタンスを作成
const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

// Request型の拡張（ユーザー情報を追加）
declare global {
  namespace Express {
    interface Request {
      user?: User; // ユーザー情報をリクエストに追加
    }
  }
}

/**
 * Cognito Access Tokenを検証するミドルウェア
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization headerを確認
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.warn('認証ヘッダーが見つかりません');
      throw new AuthenticationError('認証が必要です');
    }

    // Bearer tokenフォーマットを確認
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn({ authHeader }, '不正な認証ヘッダー形式');
      throw new AuthenticationError('不正な認証形式です');
    }

    // トークンを抽出
    const token = authHeader.substring(7); // "Bearer "を除去

    if (!token) {
      logger.warn('トークンが見つかりません');
      throw new AuthenticationError('アクセストークンが必要です');
    }

    logger.info(`アクセストークンの検証開始: ${token}`);
    const payload = parseJWTComponents(token);
    
    logger.info({ 
      sub: payload.sub,
      client_id: payload.client_id,
      token_use: payload.token_use,
      scope: payload.scope
    }, 'JWT検証成功');

    const userService = new UserService(UserRepository);
    req.user = await userService.getOrSaveUserByPayload(payload, token);

    next();
  } catch (error) {
    // aws-jwt-verifyからのエラーをAuthenticationErrorに変換
    if (error && typeof error === 'object' && 'message' in error && !(error instanceof AuthenticationError)) {
      next(new AuthenticationError(`アクセストークンが無効です`));
      return;
    }

    // エラーハンドリングはglobal errorHandlerに委譲
    next(error);
  }
};

/**
 * オプショナルな認証ミドルウェア（トークンがあれば検証、なくてもOK）
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // トークンがない場合はそのまま次へ
    next();
    return;
  }

  // トークンがある場合は検証
  await authenticateToken(req, res, next);
};

/**
 * JWTヘッダーとペイロードをパース
 */
const parseJWTComponents = (token: string): any => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    
    return payload;
  } catch (error) {
    throw new Error('Failed to parse JWT components');
  }
}
/**
 * Base64URL デコード
 */
const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return jsonPayload;
}
