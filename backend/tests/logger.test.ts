import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Request } from 'express';
import {
  logger,
  logValidationFail,
  logAuthorizationFail,
  logSysCrash,
  logNotFoundResource,
  logAuthFail,
  logAuthTokenInvalid,
  LogInfo
} from '../src/helpers/logger';

jest.mock('pino', () => {
  const mockPinoLogger = {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
  };
  
  const mockPino = jest.fn(() => mockPinoLogger) as any;
  mockPino.stdTimeFunctions = {
    isoTime: jest.fn(),
  };
  mockPino.stdSerializers = {
    err: jest.fn((err: any) => ({
      type: err?.constructor?.name,
      message: err?.message,
      stack: err?.stack,
    })),
  };
  return mockPino;
});

describe('logger（ロガー）', () => {
  let mockRequest: Request;
  const originalEnv = process.env;

  beforeEach(() => {
    mockRequest = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Test Browser)',
      },
      ip: '192.168.1.100',
      socket: {
        localAddress: '10.0.0.1',
        localPort: 3000,
      },
      hostname: 'example.com',
      protocol: 'https',
      originalUrl: '/api/test',
      method: 'GET',
    } as Request;

    process.env.APP_ID = 'test-app-id';

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('logValidationFail（バリデーション失敗ログ）', () => {
    it('バリデーション失敗を正しくログ出力すること', () => {
      // Arrange
      const message = 'Invalid input data';

      // Act
      logValidationFail(mockRequest, message);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(expect.objectContaining({
        appid: 'test-app-id',
        event: 'input_validation_fail',
        description: message,
        useragent: 'Mozilla/5.0 (Test Browser)',
        source_ip: '192.168.1.100',
        host_ip: '10.0.0.1',
        hostname: 'example.com',
        protocol: 'https',
        port: 3000,
        request_uri: '/api/test',
        request_method: 'GET',
        err: expect.any(Error),
      }));
    });
  });

  describe('logAuthorizationFail（認可失敗ログ）', () => {
    it('認可失敗を正しくログ出力すること', () => {
      // Arrange
      const message = 'Access denied';

      // Act
      logAuthorizationFail(mockRequest, message);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.error).toHaveBeenCalledWith(expect.objectContaining({
        appid: 'test-app-id',
        event: 'authz_fail',
        description: message,
        err: expect.any(Error),
        useragent: 'Mozilla/5.0 (Test Browser)',
        source_ip: '192.168.1.100',
        host_ip: '10.0.0.1',
        hostname: 'example.com',
        protocol: 'https',
        port: 3000,
        request_uri: '/api/test',
        request_method: 'GET',
      }));
    });
  });

  describe('logSysCrash（システムクラッシュログ）', () => {
    it('システムクラッシュを正しくログ出力すること', () => {
      // Arrange
      const message = 'Database connection failed';

      // Act
      logSysCrash(mockRequest, message);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.error).toHaveBeenCalledWith(expect.objectContaining({
        appid: 'test-app-id',
        event: 'sys_crash',
        description: message,
        err: expect.any(Error),
        useragent: 'Mozilla/5.0 (Test Browser)',
        source_ip: '192.168.1.100',
        host_ip: '10.0.0.1',
        hostname: 'example.com',
        protocol: 'https',
        port: 3000,
        request_uri: '/api/test',
        request_method: 'GET',
      }));
    });
  });

  describe('logNotFoundResource（リソース未発見ログ）', () => {
    it('リソース未発見を正しくログ出力すること', () => {
      // Arrange
      const message = 'User not found';

      // Act
      logNotFoundResource(mockRequest, message);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.info).toHaveBeenCalledWith({
        appid: 'test-app-id',
        event: 'not_found_resource',
        description: message,
        useragent: 'Mozilla/5.0 (Test Browser)',
        source_ip: '192.168.1.100',
        host_ip: '10.0.0.1',
        hostname: 'example.com',
        protocol: 'https',
        port: 3000,
        request_uri: '/api/test',
        request_method: 'GET',
      });
    });
  });

  describe('logAuthFail（認証失敗ログ）', () => {
    it('認証失敗を正しくログ出力すること', () => {
      // Arrange
      const message = 'Invalid credentials';

      // Act
      logAuthFail(mockRequest, message);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(expect.objectContaining({
        appid: 'test-app-id',
        event: 'authn_login_fail',
        description: message,
        useragent: 'Mozilla/5.0 (Test Browser)',
        source_ip: '192.168.1.100',
        host_ip: '10.0.0.1',
        hostname: 'example.com',
        protocol: 'https',
        port: 3000,
        request_uri: '/api/test',
        request_method: 'GET',
        err: expect.any(Error),
      }));
    });
  });

  describe('logAuthTokenInvalid（認証トークン無効ログ）', () => {
    it('認証トークン無効を正しくログ出力すること', () => {
      // Arrange
      const message = 'JWT token expired';

      // Act
      logAuthTokenInvalid(mockRequest, message);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(expect.objectContaining({
        appid: 'test-app-id',
        event: 'authn_token_invalid',
        description: message,
        useragent: 'Mozilla/5.0 (Test Browser)',
        source_ip: '192.168.1.100',
        host_ip: '10.0.0.1',
        hostname: 'example.com',
        protocol: 'https',
        port: 3000,
        request_uri: '/api/test',
        request_method: 'GET',
        err: expect.any(Error),
      }));
    });
  });

  describe('リクエスト情報の取得', () => {
    it('User-Agentが未設定の場合にundefinedを設定すること', () => {
      // Arrange
      const requestWithoutUserAgent = {
        ...mockRequest,
        headers: {},
      } as Request;

      // Act
      logValidationFail(requestWithoutUserAgent, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          useragent: undefined,
        })
      );
    });

    it('IPアドレスが未設定の場合にundefinedを設定すること', () => {
      // Arrange
      const requestWithoutIP = {
        ...mockRequest,
        ip: undefined,
      } as Request;

      // Act
      logValidationFail(requestWithoutIP, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          source_ip: undefined,
        })
      );
    });

    it('ソケット情報が未設定の場合にundefinedを設定すること', () => {
      // Arrange
      const requestWithoutSocket = {
        ...mockRequest,
        socket: {},
      } as Request;

      // Act
      logValidationFail(requestWithoutSocket, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          host_ip: undefined,
          port: undefined,
        })
      );
    });

    it('APP_IDが環境変数に設定されていない場合にundefinedを設定すること', () => {
      // Arrange
      delete process.env.APP_ID;

      // Act
      logValidationFail(mockRequest, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          appid: undefined,
        })
      );
    });
  });

  describe('異なるHTTPメソッドの処理', () => {
    it('POSTリクエストを正しく処理すること', () => {
      // Arrange
      const postRequest = {
        ...mockRequest,
        method: 'POST',
        originalUrl: '/api/users',
      } as Request;

      // Act
      logValidationFail(postRequest, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          request_method: 'POST',
          request_uri: '/api/users',
        })
      );
    });

    it('PUTリクエストを正しく処理すること', () => {
      // Arrange
      const putRequest = {
        ...mockRequest,
        method: 'PUT',
        originalUrl: '/api/users/123',
      } as Request;

      // Act
      logValidationFail(putRequest, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          request_method: 'PUT',
          request_uri: '/api/users/123',
        })
      );
    });

    it('DELETEリクエストを正しく処理すること', () => {
      // Arrange
      const deleteRequest = {
        ...mockRequest,
        method: 'DELETE',
        originalUrl: '/api/users/123',
      } as Request;

      // Act
      logValidationFail(deleteRequest, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          request_method: 'DELETE',
          request_uri: '/api/users/123',
        })
      );
    });
  });

  describe('異なるプロトコルの処理', () => {
    it('HTTPプロトコルを正しく処理すること', () => {
      // Arrange
      const httpRequest = {
        ...mockRequest,
        protocol: 'http',
      } as Request;

      // Act
      logValidationFail(httpRequest, 'test message');

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          protocol: 'http',
        })
      );
    });
  });

  describe('特殊文字を含むメッセージの処理', () => {
    it('特殊文字を含むメッセージを正しく処理すること', () => {
      // Arrange
      const specialMessage = 'Error: "Invalid JSON" with special chars: !@#$%^&*()';

      // Act
      logValidationFail(mockRequest, specialMessage);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          description: specialMessage,
        })
      );
    });

    it('日本語を含むメッセージを正しく処理すること', () => {
      // Arrange
      const japaneseMessage = 'エラー：無効なリクエストです';

      // Act
      logValidationFail(mockRequest, japaneseMessage);

      // Assert
      const pino = require('pino');
      const mockPinoInstance = pino();
      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          description: japaneseMessage,
        })
      );
    });
  });
});