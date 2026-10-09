import crypto from 'crypto';

export const hashStringWithMD5 = (input: string): string => {
  return crypto.createHash('md5').update(input).digest('hex');
}
