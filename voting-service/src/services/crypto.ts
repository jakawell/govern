import crypto from 'crypto';
import { Config } from './config';

export class Crypto {
  constructor(
    private readonly config: Config,
  ) {}

  sign(message: string): string {
    return crypto.sign('sha256', Crypto.digest(message), this.config.privateKey).toString('base64');
  }

  static verify(publicKey: string, message: string, signature: string): boolean {
    return crypto.verify('sha256', Crypto.digest(message), publicKey, Buffer.from(signature, 'base64'));
  }

  static encrypt(publicKey: string, message: string): string {
    return crypto.publicEncrypt(publicKey, Buffer.from(message, 'utf-8')).toString('base64');
  }

  decrypt(message: string): string {
    return crypto.privateDecrypt(this.config.privateKey, Buffer.from(message, 'base64')).toString('utf-8');
  }

  public static getUuid(): string {
    return crypto.randomUUID({ disableEntropyCache: true });
  }

  public static digest(message: string): Buffer {
    return crypto.createHash('sha256').update(message).digest();
  }
}
