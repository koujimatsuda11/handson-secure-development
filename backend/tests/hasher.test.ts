import { jest, describe, it, expect } from '@jest/globals';
import { hashStringWithMD5 } from '../src/helpers/hasher';

describe('hasher（ハッシャー）', () => {
  describe('hashStringWithMD5（MD5ハッシュ関数）', () => {
    it('文字列をMD5ハッシュに変換できること', () => {
      // Arrange
      const input = 'Hello, World!';
      const expectedHash = '65a8e27d8879283831b664bd8b7f0ad4';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toBe(expectedHash);
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('空文字列をハッシュ化できること', () => {
      // Arrange
      const input = '';
      const expectedHash = 'd41d8cd98f00b204e9800998ecf8427e';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toBe(expectedHash);
      expect(result).toHaveLength(32);
    });

    it('日本語文字列をハッシュ化できること', () => {
      // Arrange
      const input = 'こんにちは';
      const expectedHash = 'c0e89a293bd36c7a768e4e9d2c5475a8';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toBe(expectedHash);
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('数字の文字列をハッシュ化できること', () => {
      // Arrange
      const input = '123456789';
      const expectedHash = '25f9e794323b453885f5181f1b624d0b';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toBe(expectedHash);
      expect(result).toHaveLength(32);
    });

    it('特殊文字を含む文字列をハッシュ化できること', () => {
      // Arrange
      const input = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('長い文字列をハッシュ化できること', () => {
      // Arrange
      const input = 'A'.repeat(1000);

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('同じ入力は同じハッシュを生成すること', () => {
      // Arrange
      const input = 'test string';

      // Act
      const result1 = hashStringWithMD5(input);
      const result2 = hashStringWithMD5(input);

      // Assert
      expect(result1).toBe(result2);
    });

    it('異なる入力は異なるハッシュを生成すること', () => {
      // Arrange
      const input1 = 'test string 1';
      const input2 = 'test string 2';

      // Act
      const result1 = hashStringWithMD5(input1);
      const result2 = hashStringWithMD5(input2);

      // Assert
      expect(result1).not.toBe(result2);
      expect(result1).toHaveLength(32);
      expect(result2).toHaveLength(32);
    });

    it('スペースを含む文字列をハッシュ化できること', () => {
      // Arrange
      const input = '   hello world   ';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('改行文字を含む文字列をハッシュ化できること', () => {
      // Arrange
      const input = 'line1\nline2\rline3\r\nline4';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('Unicode文字を含む文字列をハッシュ化できること', () => {
      // Arrange
      const input = '🎉🚀💯🔥⭐';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('JSON文字列をハッシュ化できること', () => {
      // Arrange
      const input = JSON.stringify({ name: 'test', value: 123, array: [1, 2, 3] });

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('大文字小文字の違いで異なるハッシュが生成されること', () => {
      // Arrange
      const input1 = 'Hello World';
      const input2 = 'hello world';

      // Act
      const result1 = hashStringWithMD5(input1);
      const result2 = hashStringWithMD5(input2);

      // Assert
      expect(result1).not.toBe(result2);
      expect(result1).toHaveLength(32);
      expect(result2).toHaveLength(32);
    });

    it('非常に短い文字列でも32文字のハッシュが生成されること', () => {
      // Arrange
      const input = 'a';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });

    it('すべて同じ文字の文字列をハッシュ化できること', () => {
      // Arrange
      const input = 'aaaaaaaaaa';

      // Act
      const result = hashStringWithMD5(input);

      // Assert
      expect(result).toHaveLength(32);
      expect(result).toMatch(/^[a-f0-9]{32}$/);
    });
  });
});