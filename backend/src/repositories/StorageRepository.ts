import { Readable } from 'stream';
import { Buffer } from 'buffer';

// 共通のストレージインターフェース
export interface StorageOutput {
  Body: Readable;
  ContentLength?: number;
}

export interface StorageRepository {
  getObject(bucket: string, key: string): Promise<StorageOutput>;
  putObject(
    bucket: string,
    key: string,
    body: string | Uint8Array | Buffer | Readable,
  ): Promise<any>;
  deleteObject?(bucket: string, key: string): Promise<void>;
}

// S3Repositoryの型を共通インターフェースに合わせるアダプター
export class S3RepositoryAdapter implements StorageRepository {
  constructor(private s3Repository: any) {}

  async getObject(bucket: string, key: string): Promise<StorageOutput> {
    const result = await this.s3Repository.getObject(bucket, key);
    return {
      Body: result.Body,
      ContentLength: result.ContentLength
    };
  }

  async putObject(
    bucket: string,
    key: string,
    body: string | Uint8Array | Buffer | Readable,
  ): Promise<any> {
    return await this.s3Repository.putObject(bucket, key, body);
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    // S3RepositoryにdeleteObjectがない場合は何もしない
    if (this.s3Repository.deleteObject) {
      await this.s3Repository.deleteObject(bucket, key);
    }
  }
}

// FileSystemRepositoryの型を共通インターフェースに合わせるアダプター
export class FileSystemRepositoryAdapter implements StorageRepository {
  constructor(private fsRepository: any) {}

  async getObject(bucket: string, key: string): Promise<StorageOutput> {
    return await this.fsRepository.getObject(bucket, key);
  }

  async putObject(
    bucket: string,
    key: string,
    body: string | Uint8Array | Buffer | Readable,
  ): Promise<any> {
    return await this.fsRepository.putObject(bucket, key, body);
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    await this.fsRepository.deleteObject(bucket, key);
  }
}