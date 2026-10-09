import { jest, describe, beforeEach, it, expect, afterEach } from '@jest/globals';
import { Readable } from 'stream';
import { StorageRepository } from '../src/repositories/StorageRepository';
import { ValidationError } from '../src/errors/ValidationError';

// 環境変数をIconServiceがimportされる前に設定
process.env.S3_BUCKET_ICONS = 'icons';

import { IconService } from '../src/services/IconService';

// Mock the helper functions
jest.mock('../src/helpers/converter', () => ({
  streamToBuffer: jest.fn(),
}));

jest.mock('../src/helpers/hasher', () => ({
  hashStringWithMD5: jest.fn(),
}));

import { streamToBuffer } from '../src/helpers/converter';
import { hashStringWithMD5 } from '../src/helpers/hasher';

describe('IconService（アイコンサービス）', () => {
  let iconService: IconService;
  let mockStorageRepository: jest.Mocked<StorageRepository>;

  beforeEach(() => {
    // Mock StorageRepository
    mockStorageRepository = {
      getObject: jest.fn(),
      putObject: jest.fn(),
    } as any;

    iconService = new IconService(mockStorageRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getIcon（アイコン取得）', () => {
    it('PNG画像を正常に取得できること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';
      // PNG signature: 89 50 4E 47 0D 0A 1A 0A
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]);
      const expectedIconImage = 'data:image/png;base64,' + pngBuffer.toString('base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const mockStream = new Readable();
      mockStorageRepository.getObject.mockResolvedValue({ Body: mockStream } as any);
      (streamToBuffer as jest.Mock<any>).mockResolvedValue(pngBuffer);

      // Act
      const result = await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
      expect(streamToBuffer).toHaveBeenCalledWith(mockStream);
      expect(result).toBe(expectedIconImage);
    });

    it('JPEG画像を正常に取得できること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';
      // JPEG signature: FF D8 FF
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
      const expectedIconImage = 'data:image/jpeg;base64,' + jpegBuffer.toString('base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const mockStream = new Readable();
      mockStorageRepository.getObject.mockResolvedValue({ Body: mockStream } as any);
      (streamToBuffer as jest.Mock<any>).mockResolvedValue(jpegBuffer);

      // Act
      const result = await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
      expect(streamToBuffer).toHaveBeenCalledWith(mockStream);
      expect(result).toBe(expectedIconImage);
    });

    it('GIF画像を正常に取得できること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';
      // GIF signature: 47 49 46 38
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const expectedIconImage = 'data:image/gif;base64,' + gifBuffer.toString('base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const mockStream = new Readable();
      mockStorageRepository.getObject.mockResolvedValue({ Body: mockStream } as any);
      (streamToBuffer as jest.Mock<any>).mockResolvedValue(gifBuffer);

      // Act
      const result = await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
      expect(streamToBuffer).toHaveBeenCalledWith(mockStream);
      expect(result).toBe(expectedIconImage);
    });

    it('WebP画像を正常に取得できること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';
      // WebP signature: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
      const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
      const expectedIconImage = 'data:image/webp;base64,' + webpBuffer.toString('base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const mockStream = new Readable();
      mockStorageRepository.getObject.mockResolvedValue({ Body: mockStream } as any);
      (streamToBuffer as jest.Mock<any>).mockResolvedValue(webpBuffer);

      // Act
      const result = await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
      expect(streamToBuffer).toHaveBeenCalledWith(mockStream);
      expect(result).toBe(expectedIconImage);
    });

    it('未知の形式の場合、デフォルトでPNGとして処理すること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';
      // Unknown format
      const unknownBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      const expectedIconImage = 'data:image/png;base64,' + unknownBuffer.toString('base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const mockStream = new Readable();
      mockStorageRepository.getObject.mockResolvedValue({ Body: mockStream } as any);
      (streamToBuffer as jest.Mock<any>).mockResolvedValue(unknownBuffer);

      // Act
      const result = await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
      expect(streamToBuffer).toHaveBeenCalledWith(mockStream);
      expect(result).toBe(expectedIconImage);
    });

    it('アイコンが存在しない場合、空文字を返すこと', async () => {
      // Arrange
      const username = 'nonexistentuser';
      const hashedFilename = 'hashed-filename';

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const noSuchKeyError = { Code: 'NoSuchKey' };
      mockStorageRepository.getObject.mockRejectedValue(noSuchKeyError);

      // Act
      const result = await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
      expect(result).toBe('');
    });

    it('NoSuchKey以外のS3エラーが発生した場合、エラーを再スローすること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const accessDeniedError = { Code: 'AccessDenied', message: 'Access denied' };
      mockStorageRepository.getObject.mockRejectedValue(accessDeniedError);

      // Act & Assert
      await expect(iconService.getIcon(username)).rejects.toEqual(accessDeniedError);
      
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
    });

    it('streamToBufferでエラーが発生した場合、エラーを再スローすること', async () => {
      // Arrange
      const username = 'testuser';
      const hashedFilename = 'hashed-filename';

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const mockStream = new Readable();
      mockStorageRepository.getObject.mockResolvedValue({ Body: mockStream } as any);
      
      const streamError = new Error('Stream processing failed');
      (streamToBuffer as jest.Mock<any>).mockRejectedValue(streamError);

      // Act & Assert
      await expect(iconService.getIcon(username)).rejects.toThrow(streamError);
    });

    it('ユーザー名のハッシュ化が正常に行われること', async () => {
      // Arrange
      const username = 'user@example.com';
      const hashedFilename = 'md5-hash-of-email';

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      mockStorageRepository.getObject.mockRejectedValue({ Code: 'NoSuchKey' });

      // Act
      await iconService.getIcon(username);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.getObject).toHaveBeenCalledWith('icons', hashedFilename);
    });
  });

  describe('updateIcon（アイコン更新）', () => {
    it('PNG画像を正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const iconImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==';
      const hashedFilename = 'hashed-filename';
      const expectedBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==', 'base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      mockStorageRepository.putObject.mockResolvedValue(undefined);

      // Act
      const result = await iconService.updateIcon(username, iconImageData);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.putObject).toHaveBeenCalledWith(
        'icons',
        hashedFilename,
        expectedBuffer
      );
      expect(result).toBe(iconImageData);
    });

    it('JPEG画像を正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const iconImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      const hashedFilename = 'hashed-filename';
      const expectedBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      mockStorageRepository.putObject.mockResolvedValue(undefined);

      // Act
      const result = await iconService.updateIcon(username, iconImageData);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.putObject).toHaveBeenCalledWith(
        'icons',
        hashedFilename,
        expectedBuffer
      );
      expect(result).toBe(iconImageData);
    });

    it('不正なdata URL形式の場合、ValidationErrorを投げること', async () => {
      // Arrange
      const username = 'testuser';
      const invalidIconData = 'invalid-data-url';

      (hashStringWithMD5 as jest.Mock).mockReturnValue('hashed-filename');

      // Act & Assert
      await expect(iconService.updateIcon(username, invalidIconData)).rejects.toThrow(ValidationError);
      await expect(iconService.updateIcon(username, invalidIconData)).rejects.toThrow('Invalid data URL format');
    });

    it('サポートされていないMIMEタイプの場合、ValidationErrorを投げること', async () => {
      // Arrange
      const username = 'testuser';
      const invalidMimeIconData = 'data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77mgAAAABJRU5ErkJggg==';

      (hashStringWithMD5 as jest.Mock).mockReturnValue('hashed-filename');

      // Act & Assert
      await expect(iconService.updateIcon(username, invalidMimeIconData)).rejects.toThrow(ValidationError);
      await expect(iconService.updateIcon(username, invalidMimeIconData)).rejects.toThrow('Invalid MIME type. Allowed types: image/png, image/jpeg, image/gif, image/webp');
    });

    it('ファイルサイズが5MBを超える場合、ValidationErrorを投げること', async () => {
      // Arrange
      const username = 'testuser';
      // 5MB + 1 byte のバイナリデータを作成してbase64エンコード
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB
      const largeBinaryData = Buffer.alloc(maxSizeBytes + 1, 0x41); // 5MB + 1 byte, filled with 'A'
      const largeBase64Data = largeBinaryData.toString('base64');
      const largeIconData = `data:image/png;base64,${largeBase64Data}`;

      (hashStringWithMD5 as jest.Mock).mockReturnValue('hashed-filename');

      // Act & Assert
      await expect(iconService.updateIcon(username, largeIconData)).rejects.toThrow(ValidationError);
      await expect(iconService.updateIcon(username, largeIconData)).rejects.toThrow('File size exceeds maximum limit of 5MB');
    });

    it('GIF形式の画像を正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const iconImageData = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      const hashedFilename = 'hashed-filename';
      const expectedBuffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      mockStorageRepository.putObject.mockResolvedValue(undefined);

      // Act
      const result = await iconService.updateIcon(username, iconImageData);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.putObject).toHaveBeenCalledWith(
        'icons',
        hashedFilename,
        expectedBuffer
      );
      expect(result).toBe(iconImageData);
    });

    it('WebP形式の画像を正常に更新できること', async () => {
      // Arrange
      const username = 'testuser';
      const iconImageData = 'data:image/webp;base64,UklGRhoBAABXRUJQVlA4TA0BAAAvAAAAAQ8AzAwnDYAAK4AAAAA=';
      const hashedFilename = 'hashed-filename';
      const expectedBuffer = Buffer.from('UklGRhoBAABXRUJQVlA4TA0BAAAvAAAAAQ8AzAwnDYAAK4AAAAA=', 'base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      mockStorageRepository.putObject.mockResolvedValue(undefined);

      // Act
      const result = await iconService.updateIcon(username, iconImageData);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.putObject).toHaveBeenCalledWith(
        'icons',
        hashedFilename,
        expectedBuffer
      );
      expect(result).toBe(iconImageData);
    });

    it('S3アップロードでエラーが発生した場合、エラーを再スローすること', async () => {
      // Arrange
      const username = 'testuser';
      const iconImageData = 'data:image/png;base64,newimage';
      const hashedFilename = 'hashed-filename';
      const expectedBuffer = Buffer.from('newimage', 'base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      
      const uploadError = new Error('Storage upload failed');
      mockStorageRepository.putObject.mockRejectedValue(uploadError);

      // Act & Assert
      await expect(iconService.updateIcon(username, iconImageData)).rejects.toThrow(uploadError);
      
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.putObject).toHaveBeenCalledWith(
        'icons',
        hashedFilename,
        expectedBuffer
      );
    });


    it('特殊文字を含むユーザー名でも正常に処理されること', async () => {
      // Arrange
      const username = 'user+special@example.com';
      const iconImageData = 'data:image/png;base64,newimage';
      const hashedFilename = 'special-hash';
      const expectedBuffer = Buffer.from('newimage', 'base64');

      (hashStringWithMD5 as jest.Mock).mockReturnValue(hashedFilename);
      mockStorageRepository.putObject.mockResolvedValue(undefined);

      // Act
      const result = await iconService.updateIcon(username, iconImageData);

      // Assert
      expect(hashStringWithMD5).toHaveBeenCalledWith(username);
      expect(mockStorageRepository.putObject).toHaveBeenCalledWith(
        'icons',
        hashedFilename,
        expectedBuffer
      );
      expect(result).toBe(iconImageData);
    });
  });

  describe('ICON_BUCKET定数', () => {
    it('環境変数S3_BUCKET_ICONSが正しく設定されること', () => {
      // Assert
      expect(IconService.ICON_BUCKET).toBe('icons');
    });
  });
});