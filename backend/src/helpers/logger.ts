import { Request } from 'express';
import pino from 'pino';

export type LogInfo = {
  appid?: string,
  event?: string,
  description?: string,
  useragent?: string,
  source_ip?: string,
  host_ip?: string,
  hostname?: string,
  protocol?: string,
  port?: number,
  request_uri?: string,
  request_method?: string,
};

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(level) {
      return { level };
    },
    // エラーオブジェクトのフォーマッターを追加
    bindings() {
      return {};
    },
  },
  // シンプルなJSONログ出力（すべての環境で一貫性を保つ）
  serializers: {
    // エラーオブジェクトのシリアライザーを追加
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
  enabled: !process.env.IS_LOGGER_SILENT,
});

const logWithReq = (req: Request, level: string, event: string, description: string, error?: Error): void => {
  const logInfo: LogInfo = {
    appid: process.env.APP_ID,
    event,
    description,
    useragent: req.headers['user-agent'],
    source_ip: req.ip,
    host_ip: req.socket.localAddress,
    hostname: req.hostname,
    protocol: req.protocol,
    port: req.socket.localPort,
    request_uri: req.originalUrl,
    request_method: req.method,
  };

  // warn以上のレベルでstack traceを追加
  if ((level === 'warn' || level === 'error' || level === 'fatal') && error) {
    logger[level]({ ...logInfo, err: error });
  } else if (level === 'warn' || level === 'error' || level === 'fatal') {
    // エラーオブジェクトがない場合は新しいエラーを作成してstack traceを取得
    const stackError = new Error('Stack trace for logging');
    logger[level]({ ...logInfo, err: stackError });
  } else {
    logger[level](logInfo);
  }
};

export const logValidationFail = (req: Request, message: string, error?: Error): void => {
  logWithReq(req, 'warn', 'input_validation_fail', message, error);
}

export const logAuthorizationFail = (req: Request, message: string, error?: Error): void => {
  logWithReq(req, 'error', 'authz_fail', message, error);
}

export const logSysCrash = (req: Request, message: string, error?: Error): void => {
  logWithReq(req, 'error', 'sys_crash', message, error);
}

export const logNotFoundResource = (req: Request, message: string): void => {
  logWithReq(req, 'info', 'not_found_resource', message);
}

export const logAuthFail = (req: Request, message: string, error?: Error): void => {
  logWithReq(req, 'warn', 'authn_login_fail', message, error);
}

export const logAuthTokenInvalid = (req: Request, message: string, error?: Error): void => {
  logWithReq(req, 'warn', 'authn_token_invalid', message, error);
}
