import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { PostService } from '../src/services/PostService';
import { IconService } from '../src/services/IconService';
import { PostRepository, DEFAULT_LIST_LIMIT, DEFAULT_LIST_OFFSET } from '../src/repositories/PostRepository';
import { Post, PostType } from '../src/entities/Post';
import { User } from '../src/entities/User';
import { PostDto } from '../src/dtos/PostDto';
import { AuthorizationError } from '../src/errors/AuthorizationError';
import { ValidationError } from '../src/errors/ValidationError';
import { FindManyOptions } from 'typeorm';

describe('PostService（投稿サービス）', () => {
  let postService: PostService;
  let mockPostRepository: any;
  let mockIconService: jest.Mocked<IconService>;

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

  const mockPost: Post = {
    id: 1,
    content: 'Test content',
    type: PostType.POST,
    posted_at: new Date('2023-01-01'),
    user: mockUser,
    users: [],
    canBeCreatedBy: jest.fn(),
    canBeReadBy: jest.fn(),
    canBeUpdatedBy: jest.fn(),
    canBeDeletedBy: jest.fn(),
    canBeLikedBy: jest.fn(),
    canBeUnlikedBy: jest.fn(),
  } as any;

  const expectedPostDto: PostDto = {
    id: 1,
    type: 'post',
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
    // Mock PostRepository
    mockPostRepository = {
      find: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      remove: jest.fn(),
    };

    // Mock IconService
    mockIconService = {
      getIcon: jest.fn(),
      updateIcon: jest.fn(),
    } as any;

    postService = new PostService(mockPostRepository, mockIconService);

    // Reset all mocks
    jest.clearAllMocks();
  });


  describe('createPost（投稿作成）', () => {
    it('新規投稿を正常に作成できること', async () => {
      // Arrange
      const savedPost = { 
        ...mockPost,
        content: 'Test content',
      };
      mockPostRepository.save.mockImplementation((post) => {
        // save時にidとposted_atを設定
        post.id = 1;
        post.posted_at = new Date('2023-01-01');
        // canBeCreatedByのMockを設定
        post.canBeCreatedBy = jest.fn().mockReturnValue(true);
        return Promise.resolve(post);
      });
      mockIconService.getIcon.mockResolvedValue('test-icon.jpg');

      // Act
      const result = await postService.createPost('Test content', mockUser);

      // Assert
      expect(mockPostRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Test content',
          type: PostType.POST,
          user: mockUser,
          users: [],
        })
      );
      expect(result).toEqual({
        ...expectedPostDto,
        content: 'Test content',
      });
    });
  });


  describe('likePost（投稿いいね）', () => {
    it('投稿に正常にいいねできること', async () => {
      // Arrange
      const existingPost = { ...mockPost, users: [] };
      (existingPost as any).canBeLikedBy.mockReturnValue(true);
      mockPostRepository.findOneOrFail.mockResolvedValue(existingPost);
      const savedPost = { ...existingPost, users: [mockUser] };
      mockPostRepository.save.mockResolvedValue(savedPost);

      // Act
      const result = await postService.likePost(1, mockUser);

      // Assert
      expect(mockPostRepository.findOneOrFail).toHaveBeenCalledWith({
        relations: { users: true },
        where: { id: 1 },
      });
      expect(existingPost.users).toContain(mockUser);
      expect(mockPostRepository.save).toHaveBeenCalledWith(existingPost);
      expect(result).toBe(1);
    });

    it('既にいいねした投稿に再度いいねしようとした場合、バリデーションエラーが発生すること', async () => {
      // Arrange
      const existingPost = { ...mockPost, users: [mockUser] };
      (existingPost as any).canBeLikedBy.mockReturnValue(true);
      mockPostRepository.findOneOrFail.mockResolvedValue(existingPost);

      // Act & Assert
      await expect(
        postService.likePost(1, mockUser)
      ).rejects.toThrow(ValidationError);

      expect(mockPostRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('unlikePost（投稿いいね解除）', () => {
    it('投稿のいいねを正常に解除できること', async () => {
      // Arrange
      const anotherUser = { ...mockUser, id: 2, username: 'anotheruser' };
      const existingPost = { ...mockPost, users: [mockUser, anotherUser] };
      (existingPost as any).canBeUnlikedBy.mockReturnValue(true);
      mockPostRepository.findOneOrFail.mockResolvedValue(existingPost);
      mockPostRepository.save.mockResolvedValue(existingPost);

      // Act
      const result = await postService.unlikePost(1, mockUser);

      // Assert
      expect(mockPostRepository.findOneOrFail).toHaveBeenCalledWith({
        relations: { users: true },
        where: { id: 1 },
      });
      expect(existingPost.users).not.toContain(mockUser);
      expect(existingPost.users).toContain(anotherUser);
      expect(mockPostRepository.save).toHaveBeenCalledWith(existingPost);
      expect(result).toBe(1);
    });

    it('いいねしていない投稿のいいねを解除しようとした場合、バリデーションエラーが発生すること', async () => {
      // Arrange
      const existingPost = { ...mockPost, users: [] };
      (existingPost as any).canBeUnlikedBy.mockReturnValue(true);
      mockPostRepository.findOneOrFail.mockResolvedValue(existingPost);

      // Act & Assert
      await expect(
        postService.unlikePost(1, mockUser)
      ).rejects.toThrow(ValidationError);

      expect(mockPostRepository.save).not.toHaveBeenCalled();
    });
  });
});
