import express, { Express } from 'express';
import { Server } from 'http';

export class ApiApplication {
  private readonly app: Express;

  constructor(
    private readonly port: number,
  ) {
    this.app = express();
  }

  start(callback: () => void): Server {
    return this.app.listen(this.port, callback);
  }
}
