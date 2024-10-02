import { IncomingMessage, ServerResponse } from 'http';

export class Response<Body extends object> {
  constructor(
    public readonly serverResponse: ServerResponse<IncomingMessage>,
  ) {}

  public setHeader(key: string, value: string): Response<Body> {
    this.serverResponse.setHeader(key, value);
    return this;
  }

  public text(statusCode: number, body: string): Response<Body> {
    this.serverResponse.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    this.serverResponse.end(body);
    return this;
  }

  public json(statusCode: number, body: Body): Response<Body> {
    this.serverResponse.writeHead(statusCode, { 'Content-Type': 'application/json' });
    this.serverResponse.end(JSON.stringify(body));
    return this;
  }

  public empty(statusCode: number): Response<Body> {
    this.serverResponse.writeHead(statusCode);
    this.serverResponse.end();
    return this;
  }
}
