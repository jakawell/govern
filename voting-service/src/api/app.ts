import { createServer, Server } from 'http';
import { BallotController } from './ballot/controller';
import { Request } from '../utils/request';
import { Response } from '../utils/response';

export class VoterServiceApp {
  private readonly app: Server;

  constructor(
    private readonly port: number,
  ) {
    this.app = createServer((req, res) => {
      if (req.url === '/ballot') {
        const controller = new BallotController(
          new BallotRepo(),
          new KeyRepo(),
          new Crypto(),
        );

        if (req.method === 'GET') {
          controller.get(new Request(req), new Response(res));
        } else if (req.method === 'POST') {
          controller.post(new Request(req), new Response(res));
        }
      }
    });
  }

  start(callback: () => void): Server {
    return this.app.listen(this.port, callback);
  }
}
