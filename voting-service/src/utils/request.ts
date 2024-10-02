import { IncomingHttpHeaders, IncomingMessage } from 'http';

export class Request<QueryParams extends Record<string, string>, Body extends object> {
  constructor(
    public readonly incomingMessage: IncomingMessage,
  ) {}

  public get headers(): IncomingHttpHeaders {
    return this.incomingMessage.headers;
  }

  public get params(): QueryParams {
    if (!this.incomingMessage.url) {
      return {} as QueryParams;
    }
    const rawSearchParams = [
      ...new URL(this.incomingMessage.url).searchParams.entries(),
    ];
    return rawSearchParams.reduce<QueryParams>((acc, [key, value]) => ({ ...acc, [key]: value }), {} as QueryParams);
  }

  public async loadBody(): Promise<Body> {
    const chunks: Array<Buffer> = [];
    return new Promise<Body>((resolve, reject) => {
      this.incomingMessage
        .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        .on('error', reject)
        .on('end', () => {
          try {
            const stringifiedBody = Buffer.concat(chunks).toString('utf8');
            resolve(JSON.parse(stringifiedBody));
          } catch (err) {
            reject(err);
          }
        });
    });
  }
}
