import { Ballot } from '../ballot';
import { DataConnection } from './dataConnection';

export class MemoryDataConnection implements DataConnection {
  private ballots: Map<string, {
    ballot: Ballot,
    encryptedVoteId: string,
  }> = new Map();

  private publicKeys: Map<string, string> = new Map(Object.entries({
    // eslint-disable-next-line max-len
    fakeFingerprint: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDtnLp8RWiLBsgn1b63xGBp4/EFPcNjC83h02+8cxuBgR5eysIA89o8cU5LNXUq2cl9V3LSg9ho+xWNYRjw/kIzPKI33Cv6xBJ9eSqfT6e1uGnINfvVOs/oGAEnZissW4YNThVbeBtZWy2Zbt5zwN2uG9NLc5WNwb613p2O+H5BGwIDAQAB',
  }));

  public async teardown(): Promise<void> {
    this.ballots = new Map();
    this.publicKeys = new Map();
  }

  public async getBallot(ballotId: string): Promise<Ballot | null> {
    return this.ballots.get(ballotId)?.ballot ?? null;
  }

  public async submitBallot(voteId: string, encryptedVoteId: string, ballot: Ballot): Promise<boolean> {
    this.ballots.set(voteId, {
      ballot,
      encryptedVoteId,
    });
    return true;
  }

  public async getPublicKey(fingerprint: string): Promise<string | null> {
    return this.publicKeys.get(fingerprint) ?? null;
  }
}
