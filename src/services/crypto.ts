import { JSEncrypt } from 'jsencrypt';
import { SHA256 } from 'crypto-js';
import { Config } from './config';

export class Crypto {
  private readonly signer: JSEncrypt;

  constructor(
    private readonly config: Config,
  ) {
    this.signer = new JSEncrypt();
    this.signer.setPublicKey(this.config.publicKey);
    this.signer.setPrivateKey(this.config.privateKey);
  }

  sign(message: string): string {
    const signatureResult = this.signer.sign(message, Crypto.digest, 'sha256');
    if (signatureResult) {
      return signatureResult;
    }
    throw Error('Failed to sign message.');
  }

  public static digest(message: string): string {
    return SHA256(message).toString();
  }
}
