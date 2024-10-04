import { Ballot } from '../ballot';

export interface DataConnection {
  teardown(): Promise<void>;

  getBallot(ballotId: string): Promise<Ballot | null>;

  submitBallot(voteId: string, encryptedVoteId: string, ballot: Ballot): Promise<boolean>;

  getPublicKey(fingerprint: string): Promise<string | null>;
}
