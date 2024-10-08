import { Crypto } from '../../services';
import { Request } from '../../utils/request';
import { Response } from '../../utils/response';
import { DataConnection, Ballot } from '../../model';

export type ErrorResponse = {
  /** Code to identify the error. */
  code: string,

  /** Human-readable error message. */
  message?: string,
}

export type BallotRequest = {
  /** The ID of the requested ballot. */
  ballotId: string,
}

export type BallotResponse = {
  /** The vote ID, encrypted with the voter's public key, or null if no key was provided. */
  encryptedVoteId: string | null,

  /** The nonce from the client, encrypted. */
  encryptedNonce: string | null,

  /** The ballot. */
  ballot: Ballot
} | ErrorResponse;

export type BallotSubmissionRequest = {
  /** The ballot. */
  ballot: Ballot,
}

export type BallotSubmissionResponse = {
  /** The unique vote ID, encrypted. */
  encryptedVoteId: string,
} | ErrorResponse;

export class BallotController {
  constructor(
    private readonly dataConnection: DataConnection,
    private readonly crypto: Crypto,
  ) { }

  async get(
    req: Request<BallotRequest, never>,
    res: Response<BallotResponse>,
  ): Promise<Response<BallotResponse>> {
    const { headers, params } = req;

    const ballot = await this.dataConnection.getBallot(params.ballotId);

    if (!ballot) {
      return res.json(404, {
        code: '404',
        message: 'Ballot not found.',
      });
    }

    const nonce = headers['x-nonce'] as string;

    const encryptedVoteId = nonce ? this.crypto.sign(Crypto.getUuid()) : null; // only assign a vote ID if a nonce is provided

    const encryptedNonce = nonce ? this.crypto.sign(nonce) : null;

    return res.json(200, {
      encryptedVoteId,
      encryptedNonce,
      ballot,
    });
  }

  async post(
    req: Request<never, BallotSubmissionRequest>,
    res: Response<BallotSubmissionResponse>,
  ): Promise<Response<BallotSubmissionResponse>> {
    // verify authentication header exists
    const { headers } = req;
    if (
      !headers.authorization?.startsWith('Signature ')
      || !headers.date
      || !headers.digest
    ) {
      res.setHeader('WWW-Authenticate', 'Signature headers="(request-target) date digest"');
      return res.json(401, {
        code: '401',
        message: 'Ballots must be submitted with a "Signature" Authorization header.',
      });
    }

    // verify authentication header structure
    const signatureComponents = headers.authorization
      .substring(10) // ignore the first 10 characters ("Signature "; note the trailing space)
      .split(',') // the components are split by comma
      .reduce<{ [key: string]: string }>((acc, curr) => { // split the parts up from "key=value" into a key/value object
        const [key, value] = curr.split('=', 2);
        acc[key] = value.substring(1, value.length - 1); // remove the quotes
        return acc;
      }, {});
    const requiredComponents = [
      'keyId',
      'algorithm',
      'headers',
      'signature',
    ];
    if (
      !requiredComponents.every((c) => Object.keys(signatureComponents).includes(c)) // verify that all the required components were sent
      || signatureComponents.algorithm.toLowerCase() !== 'rsa-sha256' // only allow SHA256 hashing
    ) {
      res.setHeader('WWW-Authenticate', 'Signature headers="(request-target) date digest"');
      return res.json(401, {
        code: '401',
        message: 'The signature authentication header is malformed.',
      });
    }

    // verify signature
    const publicKey = await this.dataConnection.getPublicKey(signatureComponents.keyId);
    if (!publicKey) {
      return res.json(404, {
        code: '404',
        message: 'Public key not found.',
      });
    }
    const expectedSigningString = signatureComponents.headers
      .split(' ')
      .reduce<string>((acc, header) => {
        if (header === '(request-target)') {
          // eslint-disable-next-line no-param-reassign
          acc += '(request-target): post /api/ballot\n';
        } else {
          // eslint-disable-next-line no-param-reassign
          acc += `${header}: ${req.headers[header]}\n`;
        }
        return acc;
      }, '');
    if (!this.crypto.verify(publicKey, expectedSigningString, signatureComponents.signature)) {
      res.setHeader('WWW-Authenticate', 'Signature headers="(request-target) date digest"');
      return res.json(401, {
        code: '401',
        message: 'Invalid signature.',
      });
    }

    const body = await req.loadBody();

    // verify digest
    const hashedBody = Crypto.digest(JSON.stringify(body));
    if (hashedBody !== req.headers.digest) {
      res.setHeader('WWW-Authenticate', 'Signature headers="(request-target) date digest"');
      return res.json(400, {
        code: '400',
        message: 'Invalid digest.',
      });
    }

    // submit ballot
    const voteId = Crypto.getUuid();
    const encryptedVoteId = this.crypto.encrypt(publicKey, voteId);
    if (await this.dataConnection.submitBallot(voteId, encryptedVoteId, body.ballot)) {
      return res.json(201, {
        encryptedVoteId,
      });
    }

    // alert to failed vote
    return res.json(500, {
      code: '500',
      message: 'There was a failure while submitting the ballot. It has NOT been submitted. '
        + 'Try again later.',
    });
  }
}
