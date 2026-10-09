import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { IconController } from '../src/controllers/IconController';
import { IconService } from '../src/services/IconService';
import { ValidationError } from '../src/errors/ValidationError';
import { User } from '../src/entities/User';

describe('IconController（アイコンコントローラー）', () => {
  let iconController: IconController;
  let mockIconService: jest.Mocked<IconService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    cognito_sub: 'test-sub',
    email: 'testuser@example.com',
    profile: 'Test profile',
    registered_at: new Date('2023-01-01'),
    posts: [],
    likes: [],
  } as User;

  beforeEach(() => {
    // Mock IconService
    mockIconService = {
      getIcon: jest.fn(),
      updateIcon: jest.fn(),
    } as any;

    iconController = new IconController(mockIconService);

    // Mock request and response
    mockRequest = {
      params: {},
      body: {},
      user: mockUser,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    } as any;

    mockNext = jest.fn() as NextFunction;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getIcon（アイコン取得）', () => {
    it('有効なownerパラメータでアイコンを正常に取得できること', async () => {
      // Arrange
      const expectedIcon = 'data:image/png;base64,testimage';
      mockIconService.getIcon.mockResolvedValue(expectedIcon);
      mockRequest.params = { owner: 'testuser' };

      // Act
      await iconController.getIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockIconService.getIcon).toHaveBeenCalledWith('testuser');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ iconImage: expectedIcon });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('IconServiceでエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('Icon not found');
      mockIconService.getIcon.mockRejectedValue(serviceError);
      mockRequest.params = { owner: 'testuser' };

      // Act
      await iconController.getIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('updateIcon（アイコン更新）', () => {
    it('有効なiconImageでアイコンを正常に更新できること', async () => {
      // Arrange
      const iconImageData = 'data:image/png;base64,newimage';
      mockIconService.updateIcon.mockResolvedValue(iconImageData);
      mockRequest.body = { iconImage: iconImageData };

      // Act
      await iconController.updateIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockIconService.updateIcon).toHaveBeenCalledWith('testuser', iconImageData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ iconImage: iconImageData });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('IconServiceでエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('S3 upload failed');
      const iconImageData = 'data:image/png;base64,newimage';
      mockIconService.updateIcon.mockRejectedValue(serviceError);
      mockRequest.body = { iconImage: iconImageData };

      // Act
      await iconController.updateIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('IconServiceでValidationErrorが発生した場合、422ステータスコードが返されること（ファイルサイズ）', async () => {
      // Arrange
      const validationError = new ValidationError('File size exceeds maximum limit of 5MB');
      const iconImageData = 'data:image/png;base64,newimage';
      mockIconService.updateIcon.mockRejectedValue(validationError);
      mockRequest.body = { iconImage: iconImageData };

      // Act
      await iconController.updateIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(validationError);
      expect(validationError).toBeInstanceOf(ValidationError);
    });

    it('IconServiceでValidationErrorが発生した場合、422ステータスコードが返されること（MIMEタイプ）', async () => {
      // Arrange
      const validationError = new ValidationError('Invalid MIME type. Allowed types: image/png, image/jpeg, image/gif, image/webp');
      const iconImageData = 'data:image/bmp;base64,newimage';
      mockIconService.updateIcon.mockRejectedValue(validationError);
      mockRequest.body = { iconImage: iconImageData };

      // Act
      await iconController.updateIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(validationError);
      expect(validationError).toBeInstanceOf(ValidationError);
    });

    it('IconServiceでValidationErrorが発生した場合、422ステータスコードが返されること（不正なURL形式）', async () => {
      // Arrange
      const validationError = new ValidationError('Invalid data URL format');
      const iconImageData = 'invalid-data-url';
      mockIconService.updateIcon.mockRejectedValue(validationError);
      mockRequest.body = { iconImage: iconImageData };

      // Act
      await iconController.updateIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(validationError);
      expect(validationError).toBeInstanceOf(ValidationError);
    });

    it('認証されたユーザーのusernameが使用されること', async () => {
      // Arrange
      const iconImageData = 'data:image/png;base64,newimage';
      mockIconService.updateIcon.mockResolvedValue(iconImageData);
      mockRequest.body = { iconImage: iconImageData };
      
      // 異なるユーザーをreq.userに設定
      const differentUser = { ...mockUser, username: 'differentuser' };
      mockRequest.user = differentUser;

      // Act
      await iconController.updateIcon(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockIconService.updateIcon).toHaveBeenCalledWith('differentuser', iconImageData);
    });
  });
});