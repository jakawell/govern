import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { Crypto } from '../../services';
import { Ballot, BallotRepo } from './model';

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
}

export class BallotController {
  constructor(
    private readonly repo: BallotRepo,
    private readonly crypto: Crypto,
  ) { }

  async get(
    req: Request<BallotRequest, BallotResponse>,
    res: Response<BallotResponse>,
  ): Promise<Response<BallotResponse>> {
    const { headers, params } = req;

    const ballot = await this.repo.getBallot(params.ballotId);

    const nonce = headers['x-nonce'] as string;

    const encryptedVoteId = nonce ? this.crypto.sign(uuid()) : null; // only assign a vote ID if a nonce is provided

    const encryptedNonce = nonce ? this.crypto.sign(nonce) : null;

    return res.json({
      encryptedVoteId,
      encryptedNonce,
      ballot,
    });
  }
}
