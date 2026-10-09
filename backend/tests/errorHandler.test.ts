import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { errorHandler } from '../src/middlewares/global/errorHandler';
import { AuthenticationError } from '../src/errors/AuthenticationError';
import { AuthorizationError } from '../src/errors/AuthorizationError';
import { ValidationError } from '../src/errors/ValidationError';

jest.mock('../src/helpers/logger', () => ({
  logNotFoundResource: jest.fn(),
  logAuthorizationFail: jest.fn(),
  logSysCrash: jest.fn(),
  logValidationFail: jest.fn(),
  logAuthFail: jest.fn(),
}));

describe('errorHandler（エラーハンドラー）', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
    } as Request;

    mockResponse = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('EntityNotFoundError（エンティティ未発見エラー）', () => {
    it('EntityNotFoundErrorを404エラーとして処理すること', () => {
      // Arrange
      const error = new EntityNotFoundError('User', { id: 1 });

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not Found' });
      const { logNotFoundResource } = require('../src/helpers/logger');
      expect(logNotFoundResource).toHaveBeenCalledWith(mockRequest, error.message);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('AuthorizationError（認可エラー）', () => {
    it('AuthorizationErrorを403エラーとして処理すること', () => {
      // Arrange
      const error = new AuthorizationError('Access denied');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      const { logAuthorizationFail } = require('../src/helpers/logger');
      expect(logAuthorizationFail).toHaveBeenCalledWith(mockRequest, 'Access denied', error);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('AuthorizationErrorのデフォルトメッセージを処理すること', () => {
      // Arrange
      const error = new AuthorizationError();

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      const { logAuthorizationFail } = require('../src/helpers/logger');
      expect(logAuthorizationFail).toHaveBeenCalledWith(mockRequest, 'Unauthorized', error);
    });
  });

  describe('ValidationError（バリデーションエラー）', () => {
    it('ValidationErrorを422エラーとして処理すること', () => {
      // Arrange
      const error = new ValidationError('Invalid input format');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unprocessable Entity' });
      const { logValidationFail } = require('../src/helpers/logger');
      expect(logValidationFail).toHaveBeenCalledWith(mockRequest, 'Invalid input format', error);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('ValidationErrorのデフォルトメッセージを処理すること', () => {
      // Arrange
      const error = new ValidationError();

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unprocessable Entity' });
      const { logValidationFail } = require('../src/helpers/logger');
      expect(logValidationFail).toHaveBeenCalledWith(mockRequest, 'Invalid input format.', error);
    });
  });

  describe('AuthenticationError（認証エラー）', () => {
    it('AuthenticationErrorを401エラーとして処理すること', () => {
      // Arrange
      const error = new AuthenticationError('Invalid credentials');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      const { logAuthFail } = require('../src/helpers/logger');
      expect(logAuthFail).toHaveBeenCalledWith(mockRequest, 'Invalid credentials', error);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('AuthenticationErrorのデフォルトメッセージを処理すること', () => {
      // Arrange
      const error = new AuthenticationError();

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      const { logAuthFail } = require('../src/helpers/logger');
      expect(logAuthFail).toHaveBeenCalledWith(mockRequest, 'Unauthenticated', error);
    });
  });

  describe('その他のエラー（一般的なエラー）', () => {
    it('一般的なErrorを500エラーとして処理すること', () => {
      // Arrange
      const error = new Error('Database connection failed');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
      const { logSysCrash } = require('../src/helpers/logger');
      expect(logSysCrash).toHaveBeenCalledWith(mockRequest, 'Database connection failed', error);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('メッセージのない一般的なErrorを処理すること', () => {
      // Arrange
      const error = new Error();

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
      const { logSysCrash } = require('../src/helpers/logger');
      expect(logSysCrash).toHaveBeenCalledWith(mockRequest, '', error);
    });

    it('ReferenceErrorを500エラーとして処理すること', () => {
      // Arrange
      const error = new ReferenceError('Variable is not defined');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
      const { logSysCrash } = require('../src/helpers/logger');
      expect(logSysCrash).toHaveBeenCalledWith(mockRequest, 'Variable is not defined', error);
    });

    it('TypeErrorを500エラーとして処理すること', () => {
      // Arrange
      const error = new TypeError('Cannot read property of undefined');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
      const { logSysCrash } = require('../src/helpers/logger');
      expect(logSysCrash).toHaveBeenCalledWith(mockRequest, 'Cannot read property of undefined', error);
    });
  });

  describe('ヘッダー送信済みの場合の処理', () => {
    it('ヘッダーが既に送信されている場合、nextを呼び出すこと', () => {
      // Arrange
      const error = new Error('Test error');
      mockResponse.headersSent = true;

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('ヘッダー送信済みの場合、ログも出力されないこと', () => {
      // Arrange
      const error = new ValidationError('Test error');
      mockResponse.headersSent = true;

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
      const { logValidationFail, logSysCrash } = require('../src/helpers/logger');
      expect(logValidationFail).not.toHaveBeenCalled();
      expect(logSysCrash).not.toHaveBeenCalled();
    });
  });

  describe('エラーメッセージの詳細処理', () => {
    it('特殊文字を含むエラーメッセージを正しく処理すること', () => {
      // Arrange
      const error = new ValidationError('Error: "Invalid JSON" with special chars: !@#$%^&*()');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      const { logValidationFail } = require('../src/helpers/logger');
      expect(logValidationFail).toHaveBeenCalledWith(
        mockRequest,
        'Error: "Invalid JSON" with special chars: !@#$%^&*()',
        error
      );
    });

    it('日本語を含むエラーメッセージを正しく処理すること', () => {
      // Arrange
      const error = new ValidationError('エラー：無効なリクエストです');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      const { logValidationFail } = require('../src/helpers/logger');
      expect(logValidationFail).toHaveBeenCalledWith(
        mockRequest,
        'エラー：無効なリクエストです',
        error
      );
    });

    it('非常に長いエラーメッセージを正しく処理すること', () => {
      // Arrange
      const longMessage = 'A'.repeat(1000);
      const error = new ValidationError(longMessage);

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      const { logValidationFail } = require('../src/helpers/logger');
      expect(logValidationFail).toHaveBeenCalledWith(mockRequest, longMessage, error);
    });
  });

  describe('エラータイプの継承チェック', () => {
    it('カスタムValidationErrorサブクラスを正しく処理すること', () => {
      // Arrange
      class CustomValidationError extends ValidationError {
        constructor(message: string) {
          super(message);
          this.name = 'CustomValidationError';
        }
      }
      const error = new CustomValidationError('Custom validation failed');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unprocessable Entity' });
      const { logValidationFail } = require('../src/helpers/logger');
      expect(logValidationFail).toHaveBeenCalledWith(mockRequest, 'Custom validation failed', error);
    });

    it('カスタムAuthenticationErrorサブクラスを正しく処理すること', () => {
      // Arrange
      class CustomAuthenticationError extends AuthenticationError {
        constructor(message: string) {
          super(message);
          this.name = 'CustomAuthenticationError';
        }
      }
      const error = new CustomAuthenticationError('Custom auth failed');

      // Act
      errorHandler(error, mockRequest, mockResponse, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      const { logAuthFail } = require('../src/helpers/logger');
      expect(logAuthFail).toHaveBeenCalledWith(mockRequest, 'Custom auth failed', error);
    });
  });

  describe('複数エラータイプの統合テスト', () => {
    it('異なるエラータイプを連続で処理できること', () => {
      // Arrange
      const errors = [
        new ValidationError('Validation failed'),
        new AuthenticationError('Auth failed'),
        new AuthorizationError('Authorization failed'),
        new EntityNotFoundError('User', { id: 1 }),
        new Error('Generic error'),
      ];

      errors.forEach((error, index) => {
        // Reset mocks for each iteration
        jest.clearAllMocks();

        // Act
        errorHandler(error, mockRequest, mockResponse, mockNext);

        // Assert based on error type
        if (error instanceof ValidationError) {
          expect(mockResponse.status).toHaveBeenCalledWith(422);
        } else if (error instanceof AuthenticationError) {
          expect(mockResponse.status).toHaveBeenCalledWith(401);
        } else if (error instanceof AuthorizationError) {
          expect(mockResponse.status).toHaveBeenCalledWith(403);
        } else if (error instanceof EntityNotFoundError) {
          expect(mockResponse.status).toHaveBeenCalledWith(404);
        } else {
          expect(mockResponse.status).toHaveBeenCalledWith(500);
        }
      });
    });
  });
});