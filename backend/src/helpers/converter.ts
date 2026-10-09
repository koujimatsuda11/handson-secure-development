import { Buffer } from 'buffer';
import { Readable } from 'stream';

export const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Array<Buffer> = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

export const bufferToString = (buffer: Buffer, encoding: BufferEncoding = 'utf-8'): string => {
  return buffer.toString(encoding);
};
