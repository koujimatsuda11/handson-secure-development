import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { LikeController } from '../src/controllers/LikeController';
import { PostService } from '../src/services/PostService';
import { ValidationError } from '../src/errors/ValidationError';
import { User } from '../src/entities/User';

describe('LikeController（いいねコントローラー）', () => {
  let likeController: LikeController;
  let mockPostService: jest.Mocked<PostService>;
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
    // Mock PostService
    mockPostService = {
      likePost: jest.fn(),
      unlikePost: jest.fn(),
    } as any;

    likeController = new LikeController(mockPostService);

    // Mock request and response
    mockRequest = {
      body: {},
      params: {},
      user: mockUser,
    } as Partial<Request>;

    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    } as any;

    mockNext = jest.fn() as NextFunction;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('likePost（投稿いいね）', () => {
    it('有効なpostidで投稿にいいねできること', async () => {
      // Arrange
      const postid = 1;
      const expectedLikeCount = 3;
      mockPostService.likePost.mockResolvedValue(expectedLikeCount);
      mockRequest.body = { postid };

      // Act
      await likeController.likePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.likePost).toHaveBeenCalledWith(postid, mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        likeCount: expectedLikeCount,
        isLiked: true,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('postidが数値でない場合、正常に数値変換されること', async () => {
      // Arrange
      const expectedLikeCount = 2;
      mockPostService.likePost.mockResolvedValue(expectedLikeCount);
      mockRequest.body = { postid: '123' }; // 文字列

      // Act
      await likeController.likePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.likePost).toHaveBeenCalledWith(123, mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        likeCount: expectedLikeCount,
        isLiked: true,
      });
    });

    it('PostServiceでエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('Already liked');
      mockPostService.likePost.mockRejectedValue(serviceError);
      mockRequest.body = { postid: 1 };

      // Act
      await likeController.likePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('unlikePost（投稿いいね解除）', () => {
    it('有効なpostidで投稿のいいねを解除できること', async () => {
      // Arrange
      const postid = 1;
      const expectedLikeCount = 2;
      mockPostService.unlikePost.mockResolvedValue(expectedLikeCount);
      mockRequest.params = { postid: '1' };

      // Act
      await likeController.unlikePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.unlikePost).toHaveBeenCalledWith(postid, mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        likeCount: expectedLikeCount,
        isLiked: false,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('PostServiceでエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('Post not found');
      mockPostService.unlikePost.mockRejectedValue(serviceError);
      mockRequest.params = { postid: '1' };

      // Act
      await likeController.unlikePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});