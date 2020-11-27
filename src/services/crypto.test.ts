/**
 * @jest-environment jsdom
 */

import { JSEncrypt } from 'jsencrypt';
import { Config } from './config';
import { Crypto } from './crypto';

describe('Service: Crypto', () => {
  function configFactory(overrides: Partial<Config> = {}): Config {
    return {
      environment: 'development',
      logLevel: 'debug',
      appPort: 4001,
      publicKey: `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDtnLp8RWiLBsgn1b63xGBp4/EF
PcNjC83h02+8cxuBgR5eysIA89o8cU5LNXUq2cl9V3LSg9ho+xWNYRjw/kIzPKI3
3Cv6xBJ9eSqfT6e1uGnINfvVOs/oGAEnZissW4YNThVbeBtZWy2Zbt5zwN2uG9NL
c5WNwb613p2O+H5BGwIDAQAB
-----END PUBLIC KEY-----
`,
      privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDtnLp8RWiLBsgn1b63xGBp4/EFPcNjC83h02+8cxuBgR5eysIA
89o8cU5LNXUq2cl9V3LSg9ho+xWNYRjw/kIzPKI33Cv6xBJ9eSqfT6e1uGnINfvV
Os/oGAEnZissW4YNThVbeBtZWy2Zbt5zwN2uG9NLc5WNwb613p2O+H5BGwIDAQAB
AoGAE5FFljhNDK3pS8aBZzbHzdCUp57XeU+ei8tSt00vZbHRY3MFGPj77uBR10W2
uWmn+yd5cDalWrfapYLqf+YgY1kkidE0zMfxoRHzTfYi2T8NYefB1f6s+U/4R8ek
kioxox24VrcfHrMO7XXmDzWuFMxQeEndDzML1c743wHjBqkCQQD/WTfnmV4ZMwbh
2w4fHqsDkrddY30PuToB5F4k91UI7rAQUzcHwUeQSAGO/bSqrN+y1gj3mhg+AS4F
UT3LpKRtAkEA7jfs8lBlIns8LDAHIu5LdUvlrLssLEai2OUQOCBClN2ZUqezei2u
FA6xl4RK+y/h4vnpJpXCEVQXoTL9Cgg2pwJBAM/2WriNyPxe+YjyfjLMKF2VnS86
+rzWjy7BTgdvRFstAkmZbGUtfdo9Or+5Uu36M4oUFWOKpZnCHjgIbXqwUZUCQQCt
pDBgVL/TiZbL8tpQ2PhB8Ofip7DEOVzc0uOmtcUys/Dd8gX+aiu4zRkgg7sQK8/w
3g/YI1OJxA1RYFRYKrKDAkBahfLyRSHLjK3gieSWj3DBcP+9vAJ5HVC0elJqlcuz
CG6Woyn4uXBsKwDKgrzJF8tnv4KrFs9WXZ3tFhmhfJIb
-----END RSA PRIVATE KEY-----
`,
      ...overrides,
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('signs', () => {
    // arrange
    const testMessage = 'foobar';
    const config = configFactory();
    const crypto = new Crypto(config);
    const verifier = new JSEncrypt();
    verifier.setPublicKey(config.publicKey);

    // act
    const signature = crypto.sign(testMessage);

    // assert
    expect(verifier.verify(testMessage, signature, Crypto.digest)).toBe(true);
  });

  it('recognizes signing errors', () => {
    // arrange
    jest.spyOn(JSEncrypt.prototype, 'sign').mockReturnValue(false);
    const testMessage = 'foobar';
    const config = configFactory();
    const crypto = new Crypto(config);

    // act/assert
    expect(() => crypto.sign(testMessage)).toThrow('Failed to sign message.');
  });
});
