import { JSEncrypt } from 'jsencrypt';
import { SHA256 } from 'crypto-js';
import { v4 as uuid } from 'uuid';
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
    return uuid();
  }

  public static digest(message: string): string {
    return SHA256(message).toString();
  }
}
