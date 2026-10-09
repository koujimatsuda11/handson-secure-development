import { Buffer } from 'buffer';
import { Readable } from 'stream';
import { S3Client, GetObjectCommand, GetObjectCommandOutput, PutObjectCommandOutput, PutObjectCommand } from '@aws-sdk/client-s3';
import { FileSystemRepository } from './FileSystemRepository';
import { StorageRepository, S3RepositoryAdapter, FileSystemRepositoryAdapter } from './StorageRepository';

type S3ClientConfig = {
  region: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
};

export class StorageClientFactory {
  static createStorageRepository(): StorageRepository {
    const storageType = process.env.STORAGE_TYPE || 'filesystem'; // デフォルトはfilesystem
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // 本番環境は常にS3を使用
    if (nodeEnv === 'production' || storageType === 's3') {
      const s3Repository = new S3Repository(S3ClientFactory.createClient());
      return new S3RepositoryAdapter(s3Repository);
    } else {
      // 開発環境はファイルシステムを使用
      const fsRepository = new FileSystemRepository();
      return new FileSystemRepositoryAdapter(fsRepository);
    }
  }
}

export class S3ClientFactory {
  static createClient(): S3Client {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const config: S3ClientConfig = {
      region: process.env.AWS_REGION || 'ap-northeast-1',
    };

    switch (nodeEnv) {
      case 'production':
        break;
      default:
        config.endpoint = process.env.S3_ENDPOINT;
        config.forcePathStyle = true;
        config.credentials = {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        };
    }

    return new S3Client(config);
  }
}

export class S3Repository {
  constructor(private client: S3Client) {}

  async getObject(bucket: string, key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const output = await this.client.send(command);

    return output;
  }

  async putObject(
    bucket: string,
    key: string,
    body: string | Uint8Array | Buffer | Readable,
  ): Promise<PutObjectCommandOutput> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    });
    const output = await this.client.send(command);

    return output;
  }
}
