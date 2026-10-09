import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { UserService } from '../src/services/UserService';
import { User } from '../src/entities/User';
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';
import * as cognitoHelper from '../src/helpers/cognito';

jest.mock('../src/helpers/cognito');

describe('UserService（ユーザーサービス）', () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockQueryBuilder: any;

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
    // Mock QueryBuilder
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };
    
    (mockQueryBuilder.execute as any).mockResolvedValue({ raw: { affectedRows: 1 } });

    // Mock UserRepository
    mockUserRepository = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    userService = new UserService(mockUserRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getOrSaveUserByPayload（Cognitoペイロードからユーザー取得または作成）', () => {
    const mockPayload = {
      sub: 'cognito-sub-123',
      email: 'testuser@example.com',
      token_use: 'access',
      scope: 'openid email profile',
      auth_time: Date.now(),
      iss: 'https://cognito-idp.region.amazonaws.com/userpoolid',
      exp: Date.now() + 3600,
      iat: Date.now(),
      client_id: 'client-id',
      username: 'testuser',
      version: 2,
      jti: 'test-jti',
      origin_jti: 'test-origin-jti',
    } as CognitoAccessTokenPayload;

    beforeEach(() => {
      process.env.COGNITO_DOMAIN = 'test-domain.auth.region.amazoncognito.com';
    });

    it('既存ユーザーが存在する場合、そのユーザーを返すこと', async () => {
      // Arrange
      const existingUser = { ...mockUser, cognito_sub: mockPayload.sub };
      mockUserRepository.findOneBy.mockResolvedValue(existingUser);

      // Act
      const result = await userService.getOrSaveUserByPayload(mockPayload);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ cognito_sub: mockPayload.sub });
      expect(result).toBe(existingUser);
      expect(mockUserRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('ユーザーが存在しない場合でaccessTokenなしの時、新しいユーザーを作成すること', async () => {
      // Arrange
      mockUserRepository.findOneBy
        .mockResolvedValueOnce(null) // 最初の検索で見つからない
        .mockResolvedValueOnce(mockUser); // 作成後の検索で見つかる

      // Act
      const result = await userService.getOrSaveUserByPayload(mockPayload);

      // Assert
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ cognito_sub: mockPayload.sub });
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('accessTokenありでUserInfo APIが成功した場合、詳細情報でユーザーを作成すること', async () => {
      // Arrange
      const accessToken = 'valid-access-token';
      const userInfoResponse = {
        sub: 'cognito-sub-123',
        username: 'detaileduser',
        attributes: {
          sub: 'cognito-sub-123',
          email: 'detailed@example.com',
          nickname: 'Detailed User',
        },
      };

      mockUserRepository.findOneBy
        .mockResolvedValueOnce(null) // 最初の検索で見つからない
        .mockResolvedValueOnce(mockUser); // 作成後の検索で見つかる

      (cognitoHelper.fetchUserInfoFromCognitoViaGetUser as jest.MockedFunction<typeof cognitoHelper.fetchUserInfoFromCognitoViaGetUser>)
        .mockResolvedValueOnce(userInfoResponse);

      // Act
      const result = await userService.getOrSaveUserByPayload(mockPayload, accessToken);

      // Assert
      expect(cognitoHelper.fetchUserInfoFromCognitoViaGetUser).toHaveBeenCalledWith(
        accessToken,
        { region: 'ap-northeast-1', endpoint: undefined }
      );
      expect(mockQueryBuilder.values).toHaveBeenCalledWith({
        cognito_sub: mockPayload.sub,
        username: 'detaileduser',
        email: 'detailed@example.com',
        nickname: 'Detailed User',
      });
      expect(result).toBe(mockUser);
    });

    it('accessTokenありでUserInfo APIが失敗した場合、フォールバック値でユーザーを作成すること', async () => {
      // Arrange
      const accessToken = 'invalid-access-token';

      mockUserRepository.findOneBy
        .mockResolvedValueOnce(null) // 最初の検索で見つからない
        .mockResolvedValueOnce(mockUser); // 作成後の検索で見つかる

      (cognitoHelper.fetchUserInfoFromCognitoViaGetUser as jest.MockedFunction<typeof cognitoHelper.fetchUserInfoFromCognitoViaGetUser>)
        .mockRejectedValueOnce(new Error('アクセストークンが無効または期限切れです（NotAuthorizedException）。再サインインしてください。'));

      // Act
      const result = await userService.getOrSaveUserByPayload(mockPayload, accessToken);

      // Assert
      expect(cognitoHelper.fetchUserInfoFromCognitoViaGetUser).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });
  });

  describe('getProfile（プロフィール取得）', () => {
    it('プロフィールが設定されているユーザーのプロフィールを取得できること', async () => {
      // Arrange
      const username = 'testuser';
      const userWithProfile = { ...mockUser, profile: 'My awesome profile' };
      mockUserRepository.findOneOrFail.mockResolvedValue(userWithProfile);

      // Act
      const result = await userService.getProfile(username);

      // Assert
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual({
        username: 'testuser',
        nickname: 'Test User',
        profile: 'My awesome profile',
      });
    });

    it('プロフィールが設定されていないユーザーの場合、空文字を返すこと', async () => {
      // Arrange
      const username = 'noprofileuser';
      const userWithoutProfile = { ...mockUser, profile: null };
      mockUserRepository.findOneOrFail.mockResolvedValue(userWithoutProfile);

      // Act
      const result = await userService.getProfile(username);

      // Assert
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual({
        username: 'testuser',
        nickname: 'Test User',
        profile: '',
      });
    });

    it('プロフィールがundefinedのユーザーの場合、空文字を返すこと', async () => {
      // Arrange
      const username = 'undefinedprofileuser';
      const userWithUndefinedProfile = { ...mockUser, profile: undefined };
      mockUserRepository.findOneOrFail.mockResolvedValue(userWithUndefinedProfile);

      // Act
      const result = await userService.getProfile(username);

      // Assert
      expect(result).toEqual({
        username: 'testuser',
        nickname: 'Test User',
        profile: '',
      });
    });

    it('存在しないユーザーの場合、エラーが発生すること', async () => {
      // Arrange
      const username = 'nonexistentuser';
      const error = new Error('User not found');
      mockUserRepository.findOneOrFail.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.getProfile(username)).rejects.toThrow(error);
      
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { username },
      });
    });

    it('空文字のプロフィールでも正常に取得できること', async () => {
      // Arrange
      const username = 'emptyprofileuser';
      const userWithEmptyProfile = { ...mockUser, profile: '' };
      mockUserRepository.findOneOrFail.mockResolvedValue(userWithEmptyProfile);

      // Act
      const result = await userService.getProfile(username);

      // Assert
      expect(result).toEqual({
        username: 'testuser',
        nickname: 'Test User',
        profile: '',
      });
    });
  });

  describe('updateProfile（プロフィール更新）', () => {
    it('既存ユーザーのプロフィールを正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const newProfile = 'Updated profile text';
      const existingUser = { ...mockUser };
      mockUserRepository.findOneOrFail.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);

      // Act
      const result = await userService.updateProfile(username, newProfile);

      // Assert
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { username },
      });
      expect(existingUser.profile).toBe(newProfile);
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
      expect(result).toBe(newProfile);
    });

    it('プロフィールを空文字に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const emptyProfile = '';
      const existingUser = { ...mockUser, profile: 'Old profile' };
      mockUserRepository.findOneOrFail.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);

      // Act
      const result = await userService.updateProfile(username, emptyProfile);

      // Assert
      expect(existingUser.profile).toBe(emptyProfile);
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
      expect(result).toBe(emptyProfile);
    });

    it('長いプロフィールテキストでも正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const longProfile = 'a'.repeat(160); // 160文字のプロフィール
      const existingUser = { ...mockUser };
      mockUserRepository.findOneOrFail.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);

      // Act
      const result = await userService.updateProfile(username, longProfile);

      // Assert
      expect(existingUser.profile).toBe(longProfile);
      expect(result).toBe(longProfile);
    });

    it('改行を含むプロフィールでも正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const profileWithNewlines = 'Line 1\nLine 2\nLine 3';
      const existingUser = { ...mockUser };
      mockUserRepository.findOneOrFail.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue(existingUser);

      // Act
      const result = await userService.updateProfile(username, profileWithNewlines);

      // Assert
      expect(existingUser.profile).toBe(profileWithNewlines);
      expect(result).toBe(profileWithNewlines);
    });

    it('存在しないユーザーのプロフィールを更新しようとした場合、エラーが発生すること', async () => {
      // Arrange
      const username = 'nonexistentuser';
      const newProfile = 'New profile';
      const error = new Error('User not found');
      mockUserRepository.findOneOrFail.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.updateProfile(username, newProfile)).rejects.toThrow(error);
      
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { username },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('データベース保存でエラーが発生した場合、エラーを再スローすること', async () => {
      // Arrange
      const username = 'testuser';
      const newProfile = 'New profile';
      const existingUser = { ...mockUser };
      const saveError = new Error('Database save failed');
      
      mockUserRepository.findOneOrFail.mockResolvedValue(existingUser);
      mockUserRepository.save.mockRejectedValue(saveError);

      // Act & Assert
      await expect(userService.updateProfile(username, newProfile)).rejects.toThrow(saveError);
      
      expect(mockUserRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { username },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
    });
  });
});
