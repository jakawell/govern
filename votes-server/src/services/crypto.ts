import nodeCrypto from 'crypto';
import { JSEncrypt } from 'jsencrypt';
import { SHA256 } from 'crypto-js';
import { Config } from './config';

export class Crypto {
  private readonly signer: JSEncrypt;

  constructor(
    private readonly config: Config,
  ) {
    this.signer = new JSEncrypt();
    this.signer.setPrivateKey(this.config.privateKey);
  }

  sign(message: string): string {
    const signatureResult = this.signer.sign(message, Crypto.digest, 'sha256');
    if (signatureResult) {
      return signatureResult;
    }
    throw Error('Failed to sign message.');
  }

  verify(publicKey: string, message: string, signature: string): boolean {
    this.signer.setPublicKey(publicKey);
    return this.signer.verify(message, signature, Crypto.digest);
  }

  encrypt(publicKey: string, message: string): string {
    this.signer.setPublicKey(publicKey);
    return this.signer.encrypt(message);
  }

  public static getUuid(): string {
    return nodeCrypto.randomUUID({ disableEntropyCache: true });
  }

  public static digest(message: string): string {
    return SHA256(message).toString();
  }
}
