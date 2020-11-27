import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { v4 as uuid } from 'uuid';
import { Request, Response } from 'express';
import { Request as RequestMock } from 'jest-express/lib/request';
import { Response as ResponseMock } from 'jest-express/lib/response';
import { Crypto } from '../../services';
import { BallotController, BallotRequest, BallotResponse } from './controller';
import { Ballot, BallotRepo } from './model';

describe('Controller: api/ballot', () => {
  function ballotFactory(overrides: Partial<Ballot> = {}): Ballot {
    return {
      id: uuid(),
      referenda: [{
        id: uuid(),
        information: {
          title: 'Referenda #1',
          description: 'Should we use this app?',
        },
        selector: 'single-choice',
        options: [
          {
            id: uuid(),
            information: {
              title: 'Yes',
              description: 'We should',
            },
          },
          {
            id: uuid(),
            information: {
              title: 'Hell no',
              description: 'We should not',
            },
          },
        ],
      }],
      ...overrides,
    };
  }

  describe('GET', () => {
    it('returns a ballot when requested via nonce', async () => {
      // arrange
      const ballot: Ballot = ballotFactory();
      const repo = Substitute.for<BallotRepo>();
      repo.getBallot(ballot.id).resolves(ballot);
      const crypto = Substitute.for<Crypto>();
      crypto.sign('12345').returns('67890');
      crypto.sign(Arg.is.not((x) => x === '12345')).returns('abcde');
      const request = new RequestMock(`/api/ballot/${ballot.id}`);
      request.setHeaders('x-nonce', '12345');
      request.setParams('ballotId', ballot.id);
      const response = new ResponseMock();
      const controller = new BallotController(repo, crypto);

      // act
      const result = await controller.get(
        request as unknown as Request<BallotRequest, BallotResponse>,
        response as unknown as Response<BallotResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.body).toEqual({
        encryptedVoteId: 'abcde',
        encryptedNonce: '67890',
        ballot,
      });
    });

    it('returns a ballot when no nonce is provided', async () => {
      // arrange
      const ballot: Ballot = ballotFactory();
      const repo = Substitute.for<BallotRepo>();
      repo.getBallot(ballot.id).resolves(ballot);
      const crypto = Substitute.for<Crypto>();
      const request = new RequestMock(`/api/ballot/${ballot.id}`);
      request.setParams('ballotId', ballot.id);
      const response = new ResponseMock();
      const controller = new BallotController(repo, crypto);

      // act
      const result = await controller.get(
        request as unknown as Request<BallotRequest, BallotResponse>,
        response as unknown as Response<BallotResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.body).toEqual({
        encryptedVoteId: null,
        encryptedNonce: null,
        ballot,
      });
    });
  });
});
