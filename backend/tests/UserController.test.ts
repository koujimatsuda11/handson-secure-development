import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { UserController } from '../src/controllers/UserController';
import { UserService } from '../src/services/UserService';
import { ValidationError } from '../src/errors/ValidationError';
import { User } from '../src/entities/User';

describe('UserController（ユーザーコントローラー）', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    cognito_sub: 'cognito-sub-123',
    email: 'testuser@example.com',
    nickname: 'Test User',
    profile: 'Test profile',
    registered_at: new Date('2023-01-01'),
    posts: [],
    likes: [],
  } as User;

  beforeEach(() => {
    // Mock UserService
    mockUserService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      getOrSaveUser: jest.fn(),
    } as any;

    userController = new UserController(mockUserService);

    // Mock request and response
    mockRequest = {
      params: {},
      body: {},
      user: mockUser, // ユーザー情報をリクエストに追加
    } as Partial<Request>;

    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    } as any;

    mockNext = jest.fn() as NextFunction;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getProfile（プロフィール取得）', () => {
    it('有効なownerパラメータでプロフィールを正常に取得できること', async () => {
      // Arrange
      const expectedProfile = {
        username: 'testuser',
        nickname: 'Test User',
        profile: 'This is my profile',
      };
      mockUserService.getProfile.mockResolvedValue(expectedProfile);
      mockRequest.params = { owner: 'testuser' };

      // Act
      await userController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUserService.getProfile).toHaveBeenCalledWith('testuser');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedProfile);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('UserServiceでエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('User not found');
      mockUserService.getProfile.mockRejectedValue(serviceError);
      mockRequest.params = { owner: 'testuser' };

      // Act
      await userController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('空のプロフィールでも正常に取得できること', async () => {
      // Arrange
      const emptyProfile = {
        username: 'userwithnoprofile',
        nickname: null,
        profile: '',
      };
      mockUserService.getProfile.mockResolvedValue(emptyProfile);
      mockRequest.params = { owner: 'userwithnoprofile' };

      // Act
      await userController.getProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUserService.getProfile).toHaveBeenCalledWith('userwithnoprofile');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(emptyProfile);
    });
  });

  describe('updateProfile（プロフィール更新）', () => {
    it('有効なprofileでプロフィールを正常に更新できること', async () => {
      // Arrange
      const newProfile = 'Updated profile text';
      mockUserService.updateProfile.mockResolvedValue(newProfile);
      mockRequest.body = { profile: newProfile };

      // Act
      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('testuser', newProfile);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ profile: newProfile });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('profileが160文字ちょうどの場合、正常に処理されること', async () => {
      // Arrange
      const profile160 = 'a'.repeat(160);
      mockRequest.body = { profile: profile160 };
      mockResponse.locals = { user: { username: 'testuser' } };
      mockUserService.updateProfile.mockResolvedValue(profile160);

      // Act
      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('testuser', profile160);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ profile: profile160 });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('認証されたユーザーのusernameが使用されること', async () => {
      // Arrange
      const newProfile = 'New profile';
      mockUserService.updateProfile.mockResolvedValue(newProfile);
      mockRequest.body = { profile: newProfile };
      
      // 異なるユーザーをres.localsに設定
      const differentUser = { ...mockUser, username: 'differentuser' };
      mockRequest.user = differentUser;

      // Act
      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('differentuser', newProfile);
    });

    it('UserServiceでエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('Database error');
      const newProfile = 'Updated profile';
      mockUserService.updateProfile.mockRejectedValue(serviceError);
      mockRequest.body = { profile: newProfile };

      // Act
      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('改行を含むプロフィールでも正常に更新できること', async () => {
      // Arrange
      const profileWithNewlines = 'Line 1\\nLine 2\\nLine 3';
      mockUserService.updateProfile.mockResolvedValue(profileWithNewlines);
      mockRequest.body = { profile: profileWithNewlines };

      // Act
      await userController.updateProfile(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockUserService.updateProfile).toHaveBeenCalledWith('testuser', profileWithNewlines);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ profile: profileWithNewlines });
    });
  });
});
