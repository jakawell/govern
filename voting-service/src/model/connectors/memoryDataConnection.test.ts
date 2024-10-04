import { Ballot } from '../ballot';
import { MemoryDataConnection } from './memoryDataConnection';

describe('Memory Data Connection', () => {
  it('should get a ballot', async () => {
    // arrange
    const memoryDataConnection = new MemoryDataConnection();

    const ballot: Ballot = {
      id: 'ballotId',
      referenda: [],
    };

    await memoryDataConnection.submitBallot('ballotId', 'encryptedVoteId', ballot);

    // act
    const result = await memoryDataConnection.getBallot('ballotId');

    // assert
    expect(result).toEqual(ballot);
  });

  it('should return null if the ballot does not exist', async () => {
    // arrange
    const memoryDataConnection = new MemoryDataConnection();

    // act
    const result = await memoryDataConnection.getBallot('ballotId');

    // assert
    expect(result).toBeNull();
  });

  it('should submit a ballot', async () => {
    // arrange
    const memoryDataConnection = new MemoryDataConnection();

    const ballot: Ballot = {
      id: 'ballotId',
      referenda: [],
    };

    // act
    const result = await memoryDataConnection.submitBallot('ballotId', 'encryptedVoteId', ballot);

    // assert
    expect(result).toBe(true);
    expect(await memoryDataConnection.getBallot('ballotId')).toEqual(ballot);
  });

  it('should get a public key', async () => {
    // arrange
    const memoryDataConnection = new MemoryDataConnection();

    // act
    const result = await memoryDataConnection.getPublicKey('fakeFingerprint');

    // assert
    // eslint-disable-next-line max-len
    expect(result).toEqual('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDtnLp8RWiLBsgn1b63xGBp4/EFPcNjC83h02+8cxuBgR5eysIA89o8cU5LNXUq2cl9V3LSg9ho+xWNYRjw/kIzPKI33Cv6xBJ9eSqfT6e1uGnINfvVOs/oGAEnZissW4YNThVbeBtZWy2Zbt5zwN2uG9NLc5WNwb613p2O+H5BGwIDAQAB');
  });

  it('should return null if the public key does not exist', async () => {
    // arrange
    const memoryDataConnection = new MemoryDataConnection();

    // act
    const result = await memoryDataConnection.getPublicKey('foobar');

    // assert
    expect(result).toBeNull();
  });

  it('should teardown', async () => {
    // arrange
    const memoryDataConnection = new MemoryDataConnection();

    const ballot: Ballot = {
      id: 'ballotId',
      referenda: [],
    };
    await memoryDataConnection.submitBallot('ballotId', 'encryptedVoteId', ballot);

    // act
    await memoryDataConnection.teardown();

    // assert
    expect(await memoryDataConnection.getBallot('ballotId')).toBeNull();
    expect(await memoryDataConnection.getPublicKey('fakeFingerprint')).toBeNull();
  });
});
