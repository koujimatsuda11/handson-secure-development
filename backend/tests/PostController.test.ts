import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { PostController } from '../src/controllers/PostController';
import { PostService } from '../src/services/PostService';
import { ValidationError } from '../src/errors/ValidationError';
import { PostDto } from '../src/dtos/PostDto';
import { User } from '../src/entities/User';

describe('PostController（投稿コントローラー）', () => {
  let postController: PostController;
  let mockPostService: jest.Mocked<PostService>;
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

  const mockPostDto: PostDto = {
    id: 1,
    type: 'POST',
    content: 'Test content',
    user: {
      username: 'testuser',
      nickname: 'Test User',
      iconImage: 'test-icon.jpg',
    },
    postedAt: new Date('2023-01-01'),
    likeCount: 0,
    isLiked: false,
  };

  beforeEach(() => {
    // Create mock PostService
    mockPostService = {
      findPosts: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    } as any;

    postController = new PostController(mockPostService);

    // Mock request and response
    mockRequest = {
      query: {},
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

  describe('getPosts（投稿一覧取得）', () => {
    it('有効なパラメータで投稿一覧を正常に取得できること', async () => {
      // Arrange
      mockPostService.findPosts.mockResolvedValue([mockPostDto]);
      mockRequest.query = { offset: '0', limit: '10' };
      mockRequest.user = mockUser;

      // Act
      await postController.getPosts(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.findPosts).toHaveBeenCalledWith(1, '', 0, 10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ Items: [mockPostDto] });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('サービス層でエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      mockPostService.findPosts.mockRejectedValue(serviceError);
      mockRequest.query = { offset: '0', limit: '10' };
      mockRequest.user = mockUser;

      // Act
      await postController.getPosts(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getOwnerPosts（特定ユーザーの投稿一覧取得）', () => {
    it('有効なパラメータで特定ユーザーの投稿一覧を正常に取得できること', async () => {
      // Arrange
      mockPostService.findPosts.mockResolvedValue([mockPostDto]);
      mockRequest.params = { owner: 'testuser' };
      mockRequest.query = { offset: '0', limit: '10' };
      mockRequest.user = mockUser;

      // Act
      await postController.getOwnerPosts(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.findPosts).toHaveBeenCalledWith(1, 'testuser', 0, 10);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ Items: [mockPostDto] });
    });
  });

  describe('postPost（投稿作成）', () => {
    it('有効なデータで新規投稿を正常に作成できること', async () => {
      // Arrange
      mockPostService.createPost.mockResolvedValue(mockPostDto);
      mockRequest.body = { content: 'Test content' };

      // Act
      await postController.postPost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.createPost).toHaveBeenCalledWith('Test content', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPostDto);
    });

  });

  describe('updatePost（投稿更新）', () => {
    it('有効なデータで投稿を正常に更新できること', async () => {
      // Arrange
      const updatedPostDto = { ...mockPostDto, content: 'Updated content' };
      mockPostService.updatePost.mockResolvedValue(updatedPostDto);
      mockRequest.params = { postid: '1' };
      mockRequest.body = { content: 'Updated content' };

      // Act
      await postController.updatePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.updatePost).toHaveBeenCalledWith(1, 'Updated content', mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedPostDto);
    });

  });

  describe('deletePost（投稿削除）', () => {
    it('有効なIDで投稿を正常に削除できること', async () => {
      // Arrange
      mockPostService.deletePost.mockResolvedValue();
      mockRequest.params = { postid: '1' };

      // Act
      await postController.deletePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPostService.deletePost).toHaveBeenCalledWith(1, mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalledWith({});
    });

    it('投稿削除時にサービス層でエラーが発生した場合、エラーハンドリングが正常に動作すること', async () => {
      // Arrange
      const serviceError = new Error('Post not found');
      mockPostService.deletePost.mockRejectedValue(serviceError);
      mockRequest.params = { postid: '1' };

      // Act
      await postController.deletePost(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});
