declare module 'jsencrypt' {
  export interface IJSEncryptOptions {
    /** The key size in bits. Default: 1024 */
    default_key_size?: number;
    /** The hexadecimal representation of the public exponent. Default: '010001' */
    default_public_exponent?: string;
    /** Whether log warn/error or not. Default: false */
    log?: boolean;
  }
  
  export class JSEncrypt {
    constructor(options?: IJSEncryptOptions);

    /**
     * Method to set the rsa key parameter (one method is enough to set both the public
     * and the private key, since the private key contains the public key paramenters)
     * Log a warning if logs are enabled
     * @param {Object|string} key the pem encoded string or an object (with or without header/footer)
     * @public
     */
    public setKey(key: string): void;

    /**
     * Returns the pem encoded representation of the private key
     * If the key doesn't exists a new key will be created
     * @returns {string} pem encoded representation of the private key WITH header and footer
     * @public
     */
    public getPrivateKey(): string;

    /**
     * Returns the pem encoded representation of the private key
     * If the key doesn't exists a new key will be created
     * @returns {string} pem encoded representation of the private key WITHOUT header and footer
     * @public
     */
    public getPrivateKeyB64(): string;

    /**
     * Proxy method for setKey, for api compatibility
     * @see setKey
     * @public
     */
    public setPrivateKey(privkey: string): void;

    /**
     * Returns the pem encoded representation of the public key
     * If the key doesn't exists a new key will be created
     * @returns {string} pem encoded representation of the public key WITH header and footer
     * @public
     */
    public getPublicKey(): string;

    /**
     * Returns the pem encoded representation of the public key
     * If the key doesn't exists a new key will be created
     * @returns {string} pem encoded representation of the public key WITHOUT header and footer
     * @public
     */
    public getPublicKeyB64(): string;

    /**
     * Proxy method for setKey, for api compatibility
     * @see setKey
     * @public
     */
    public setPublicKey(pubkey: string);

    /**
     * Proxy method for RSAKey object's encrypt, encrypt the string using the public
     * components of the rsa key object. Note that if the object was not set will be created
     * on the fly (by the getKey method) using the parameters passed in the JSEncrypt constructor
     * @param {string} str the string to encrypt
     * @return {string} the encrypted string encoded in base64
     * @public
     */
    public encrypt(key: string): string;

    /**
     * Proxy method for RSAKey object's decrypt, decrypt the string using the private
     * components of the rsa key object. Note that if the object was not set will be created
     * on the fly (by the getKey method) using the parameters passed in the JSEncrypt constructor
     * @param {string} str base64 encoded crypted string to decrypt
     * @return {string} the decrypted string
     * @public
     */
    public decrypt(str: string): string;

    /**
     * Proxy method for RSAKey object's sign.
     * @param {string} str the string to sign
     * @param {function} digestMethod hash method
     * @param {string} digestName the name of the hash algorithm
     * @return {string} the signature encoded in base64
     * @public
     */
    public sign(str: string, digestMethod: (str: string) => string, digestName: string): string | false;

    /**
     * Proxy method for RSAKey object's verify.
     * @param {string} str the string to verify
     * @param {string} signature the signature encoded in base64 to compare the string to
     * @param {function} digestMethod hash method
     * @return {boolean} whether the data and signature match
     * @public
     */
    public verify(str: string, signature: string, digestMethod: (str: string) => string): boolean;

    /**
     * Getter for the current JSEncryptRSAKey object. If it doesn't exists a new object
     * will be created and returned
     * @param {callback} [cb] the callback to be called if we want the key to be generated
     * in an async fashion
     * @returns {JSEncryptRSAKey} the JSEncryptRSAKey object
     * @public
     */
    public getKey(cb?: () => void): any;
  }
}