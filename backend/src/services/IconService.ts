import { Readable } from 'stream';
import { BaseService } from './BaseService';
import { streamToBuffer } from '../helpers/converter';
import { hashStringWithMD5 } from '../helpers/hasher';
import { StorageRepository } from '../repositories/StorageRepository';
import { ValidationError } from '../errors/ValidationError';

export class IconService extends BaseService<
  { storageRepository: StorageRepository; },
  {}
> {
  static ICON_BUCKET = process.env.S3_BUCKET_ICONS;

  constructor (storageRepository: StorageRepository) {
    super({ storageRepository }, {});
  }

  async getIcon(username: string): Promise<string> {
    const filename = hashStringWithMD5(username);
    
    // バイナリデータからMIMEタイプを推定
    const detectMimeType = (buffer: Buffer): string => {
      const header = buffer.slice(0, 12);
      
      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        return 'image/png';
      }
      
      // JPEG: FF D8 FF
      if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
        return 'image/jpeg';
      }
      
      // GIF: 47 49 46 38 (GIF8)
      if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) {
        return 'image/gif';
      }
      
      // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
      if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
          header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
        return 'image/webp';
      }
      
      // デフォルトはpng
      return 'image/png';
    };
    
    try {
      const imageOutput = await this.repos.storageRepository.getObject(IconService.ICON_BUCKET, filename);
      const imageBuffer = await streamToBuffer(imageOutput.Body as Readable);
      
      const mimeType = detectMimeType(imageBuffer);
      const base64Data = imageBuffer.toString('base64');
      return `data:${mimeType};base64,${base64Data}`;
    } catch (error) {
      if (error.Code === 'NoSuchKey') {
        return ""; // ファイルがない場合は、空文字を返す
      }
      throw error; // それ以外はもっかいthrowする
    }
  }

  async updateIcon(username: string, iconImage: string): Promise<string> {
    const filename = hashStringWithMD5(username);
    
    // data URLからMIMEタイプを抽出
    const mimeMatch = iconImage.match(/^data:([^;]+);base64,/);
    if (!mimeMatch) {
      throw new ValidationError('Invalid data URL format');
    }
    
    const mimeType = mimeMatch[1];
    
    // MIMEタイプバリデーション
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new ValidationError(`Invalid MIME type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }
    
    const base64Data = iconImage.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // ファイルサイズバリデーション (5MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (buffer.length > maxSizeBytes) {
      throw new ValidationError(`File size exceeds maximum limit of ${maxSizeBytes / (1024 * 1024)}MB`);
    }
    
    // バイナリデータとして保存、拡張子なし
    await this.repos.storageRepository.putObject(IconService.ICON_BUCKET, filename, buffer);

    return iconImage;
  }
}
