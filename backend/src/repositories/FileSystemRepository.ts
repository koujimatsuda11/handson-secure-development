import { promises as fs } from 'fs';
import * as path from 'path';
import { Buffer } from 'buffer';
import { Readable } from 'stream';

export interface FileSystemOutput {
  Body: Readable;
  ContentLength?: number;
}

export class FileSystemRepository {
  private basePath: string;

  constructor(basePath: string = '/app/storage/icons') {
    this.basePath = basePath;
  }

  async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // ディレクトリが既に存在する場合は無視
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async getObject(bucket: string, key: string): Promise<FileSystemOutput> {
    const filePath = path.join(this.basePath, bucket, key);
    
    try {
      const buffer = await fs.readFile(filePath);
      const stream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        }
      });

      return {
        Body: stream,
        ContentLength: buffer.length
      };
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        // S3のNoSuchKeyエラーと同等のエラーを投げる
        const noSuchKeyError = new Error('The specified key does not exist.') as any;
        noSuchKeyError.Code = 'NoSuchKey';
        noSuchKeyError.name = 'NoSuchKey';
        throw noSuchKeyError;
      }
      throw error;
    }
  }

  async putObject(
    bucket: string,
    key: string,
    body: string | Uint8Array | Buffer | Readable,
  ): Promise<{ ETag?: string }> {
    const filePath = path.join(this.basePath, bucket, key);
    
    await this.ensureDirectoryExists(filePath);

    let buffer: Buffer;
    
    if (body instanceof Buffer) {
      buffer = body;
    } else if (body instanceof Uint8Array) {
      buffer = Buffer.from(body);
    } else if (typeof body === 'string') {
      buffer = Buffer.from(body, 'utf8');
    } else if (body instanceof Readable) {
      // Readableストリームをバッファに変換
      const chunks: Buffer[] = [];
      for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      buffer = Buffer.concat(chunks);
    } else {
      throw new Error('Unsupported body type');
    }

    await fs.writeFile(filePath, buffer);
    
    return {
      ETag: `"${Date.now()}"` // 簡単なETagを生成
    };
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const filePath = path.join(this.basePath, bucket, key);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
      // ファイルが存在しない場合は無視
    }
  }

  async listObjects(bucket: string, prefix?: string): Promise<string[]> {
    const bucketPath = path.join(this.basePath, bucket);
    
    try {
      const files = await fs.readdir(bucketPath, { recursive: true });
      return files
        .filter(file => typeof file === 'string')
        .filter(file => !prefix || file.startsWith(prefix))
        .map(file => file.toString());
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
}