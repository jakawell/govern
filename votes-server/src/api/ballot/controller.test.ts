/**
 * @jest-environment jsdom
 */

import nodeCrypto from 'crypto';
import { Arg, Substitute } from '@fluffy-spoon/substitute';
import { Request, Response } from 'express';
import { Request as RequestMock } from 'jest-express/lib/request';
import { Response as ResponseMock } from 'jest-express/lib/response';
import { Crypto } from '../../services';
import {
  BallotController,
  BallotRequest,
  BallotResponse,
  BallotSubmissionRequest,
  BallotSubmissionResponse,
} from './controller';
import { Ballot, BallotRepo, KeyRepo } from '../../dal/ballots.model';

describe('Controller: api/ballot', () => {
  function ballotFactory(overrides: Partial<Ballot> = {}): Ballot {
    return {
      id: nodeCrypto.randomUUID(),
      referenda: [{
        id: nodeCrypto.randomUUID(),
        information: {
          title: 'Referenda #1',
          description: 'Should we use this app?',
        },
        selector: 'single-choice',
        options: [
          {
            id: nodeCrypto.randomUUID(),
            information: {
              title: 'Yes',
              description: 'We should',
            },
          },
          {
            id: nodeCrypto.randomUUID(),
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
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.getBallot(ballot.id).resolves(ballot);
      const keyRepo = Substitute.for<KeyRepo>();
      const crypto = Substitute.for<Crypto>();
      crypto.sign('12345').returns('67890');
      crypto.sign(Arg.is.not((x) => x === '12345')).returns('abcde');
      const request = new RequestMock(`/api/ballot/${ballot.id}`);
      request.setHeaders('x-nonce', '12345');
      request.setParams('ballotId', ballot.id);
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

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
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.getBallot(ballot.id).resolves(ballot);
      const keyRepo = Substitute.for<KeyRepo>();
      const crypto = Substitute.for<Crypto>();
      const request = new RequestMock(`/api/ballot/${ballot.id}`);
      request.setParams('ballotId', ballot.id);
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

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

  describe('POST', () => {
    it('submits a ballot', async () => {
      // arrange
      const voteId = nodeCrypto.randomUUID();
      const encryptedVoteId = 'encrypted';
      const ballot: Ballot = ballotFactory();
      const clientPublicKeyFingerprint = 'fingerprint';
      const clientPublicKey = 'publicKey';
      const clientSignature = 'signature';
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.submitBallot(voteId, encryptedVoteId, ballot).resolves(true);
      const keyRepo = Substitute.for<KeyRepo>();
      keyRepo.getPublicKey(clientPublicKeyFingerprint).resolves(clientPublicKey);
      const crypto = Substitute.for<Crypto>();
      crypto.verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature).returns(true);
      crypto.encrypt(clientPublicKey, voteId).returns(encryptedVoteId);
      jest.spyOn(Crypto, 'getUuid').mockReturnValue(voteId);
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        `Signature keyId="${clientPublicKeyFingerprint}",algorithm="rsa-sha256",`
          + `headers="(request-target) host date digest",signature="${clientSignature}"`,
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        encryptedVoteId,
      });
    });

    it('returns 401 if authorization header is missing', async () => {
      // arrange
      const ballot: Ballot = ballotFactory();
      const ballotRepo = Substitute.for<BallotRepo>();
      const keyRepo = Substitute.for<KeyRepo>();
      const crypto = Substitute.for<Crypto>();
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'Ballots must be submitted with a "Signature" Authorization header.',
      });
    });

    it('returns 401 if authorization header is not a Signature', async () => {
      // arrange
      const ballot: Ballot = ballotFactory();
      const ballotRepo = Substitute.for<BallotRepo>();
      const keyRepo = Substitute.for<KeyRepo>();
      const crypto = Substitute.for<Crypto>();
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        'Bearer foo',
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'Ballots must be submitted with a "Signature" Authorization header.',
      });
    });

    it('returns 401 if date header is missing', async () => {
      // arrange
      const ballot: Ballot = ballotFactory();
      const ballotRepo = Substitute.for<BallotRepo>();
      const keyRepo = Substitute.for<KeyRepo>();
      const crypto = Substitute.for<Crypto>();
      const request = new RequestMock('/api/ballot');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        'Signature keyId="fingerprint",algorithm="rsa-sha256",'
          + 'headers="(request-target) host date digest",signature="signature"',
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'Ballots must be submitted with a "Signature" Authorization header.',
      });
    });

    it('returns 401 if digest header is missing', async () => {
      // arrange
      const ballot: Ballot = ballotFactory();
      const ballotRepo = Substitute.for<BallotRepo>();
      const keyRepo = Substitute.for<KeyRepo>();
      const crypto = Substitute.for<Crypto>();
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders(
        'authorization',
        'Signature keyId="fingerprint",algorithm="rsa-sha256",'
          + 'headers="(request-target) host date digest",signature="signature"',
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'Ballots must be submitted with a "Signature" Authorization header.',
      });
    });

    it('returns 401 if hashing algorithm is not SHA256', async () => {
      // arrange
      const voteId = nodeCrypto.randomUUID();
      const encryptedVoteId = 'encrypted';
      const ballot: Ballot = ballotFactory();
      const clientPublicKeyFingerprint = 'fingerprint';
      const clientPublicKey = 'publicKey';
      const clientSignature = 'signature';
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.submitBallot(voteId, encryptedVoteId, ballot).resolves(true);
      const keyRepo = Substitute.for<KeyRepo>();
      keyRepo.getPublicKey(clientPublicKeyFingerprint).resolves(clientPublicKey);
      const crypto = Substitute.for<Crypto>();
      crypto.verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature).returns(true);
      crypto.encrypt(clientPublicKey, voteId).returns(encryptedVoteId);
      jest.spyOn(Crypto, 'getUuid').mockReturnValue(voteId);
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        `Signature keyId="${clientPublicKeyFingerprint}",algorithm="rsa-sha1",`
          + `headers="(request-target) host date digest",signature="${clientSignature}"`,
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'The signature authentication header is malformed.',
      });
    });

    it('returns 401 if authentication is missing required components', async () => {
      // arrange
      const voteId = nodeCrypto.randomUUID();
      const encryptedVoteId = 'encrypted';
      const ballot: Ballot = ballotFactory();
      const clientPublicKeyFingerprint = 'fingerprint';
      const clientPublicKey = 'publicKey';
      const clientSignature = 'signature';
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.submitBallot(voteId, encryptedVoteId, ballot).resolves(true);
      const keyRepo = Substitute.for<KeyRepo>();
      keyRepo.getPublicKey(clientPublicKeyFingerprint).resolves(clientPublicKey);
      const crypto = Substitute.for<Crypto>();
      crypto.verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature).returns(true);
      crypto.encrypt(clientPublicKey, voteId).returns(encryptedVoteId);
      jest.spyOn(Crypto, 'getUuid').mockReturnValue(voteId);
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        `Signature keyId="${clientPublicKeyFingerprint}",algorithm="rsa-sha256",`
          + 'headers="(request-target) host date digest"',
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'The signature authentication header is malformed.',
      });
    });

    it('returns 401 if signature is invalid', async () => {
      // arrange
      const voteId = nodeCrypto.randomUUID();
      const encryptedVoteId = 'encrypted';
      const ballot: Ballot = ballotFactory();
      const clientPublicKeyFingerprint = 'fingerprint';
      const clientPublicKey = 'publicKey';
      const clientSignature = 'signature';
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.submitBallot(voteId, encryptedVoteId, ballot).resolves(true);
      const keyRepo = Substitute.for<KeyRepo>();
      keyRepo.getPublicKey(clientPublicKeyFingerprint).resolves(clientPublicKey);
      const crypto = Substitute.for<Crypto>();
      crypto.verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature).returns(false);
      crypto.encrypt(clientPublicKey, voteId).returns(encryptedVoteId);
      jest.spyOn(Crypto, 'getUuid').mockReturnValue(voteId);
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        `Signature keyId="${clientPublicKeyFingerprint}",algorithm="rsa-sha256",`
          + `headers="(request-target) host date digest",signature="${clientSignature}"`,
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      crypto.received(1).verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature);
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        code: '401',
        message: 'Invalid signature.',
      });
    });

    it('returns 400 if digest does not match', async () => {
      // arrange
      const voteId = nodeCrypto.randomUUID();
      const encryptedVoteId = 'encrypted';
      const ballot: Ballot = ballotFactory();
      const clientPublicKeyFingerprint = 'fingerprint';
      const clientPublicKey = 'publicKey';
      const clientSignature = 'signature';
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.submitBallot(voteId, encryptedVoteId, ballot).resolves(true);
      const keyRepo = Substitute.for<KeyRepo>();
      keyRepo.getPublicKey(clientPublicKeyFingerprint).resolves(clientPublicKey);
      const crypto = Substitute.for<Crypto>();
      crypto.verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature).returns(true);
      crypto.encrypt(clientPublicKey, voteId).returns(encryptedVoteId);
      jest.spyOn(Crypto, 'getUuid').mockReturnValue(voteId);
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        foo: 'bar',
      })));
      request.setHeaders(
        'authorization',
        `Signature keyId="${clientPublicKeyFingerprint}",algorithm="rsa-sha256",`
          + `headers="(request-target) host date digest",signature="${clientSignature}"`,
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual({
        code: '400',
        message: 'Invalid digest.',
      });
    });

    it('submits a ballot', async () => {
      // arrange
      const voteId = nodeCrypto.randomUUID();
      const encryptedVoteId = 'encrypted';
      const ballot: Ballot = ballotFactory();
      const clientPublicKeyFingerprint = 'fingerprint';
      const clientPublicKey = 'publicKey';
      const clientSignature = 'signature';
      const ballotRepo = Substitute.for<BallotRepo>();
      ballotRepo.submitBallot(voteId, encryptedVoteId, ballot).resolves(false);
      const keyRepo = Substitute.for<KeyRepo>();
      keyRepo.getPublicKey(clientPublicKeyFingerprint).resolves(clientPublicKey);
      const crypto = Substitute.for<Crypto>();
      crypto.verify(clientPublicKey, `(request-target): post /api/ballot
host: localhost
date: 2020-11-30T12:34:56.789Z
digest: ${Crypto.digest(JSON.stringify({
    ballot,
  }))}
`, clientSignature).returns(true);
      crypto.encrypt(clientPublicKey, voteId).returns(encryptedVoteId);
      jest.spyOn(Crypto, 'getUuid').mockReturnValue(voteId);
      const request = new RequestMock('/api/ballot');
      request.setHeaders('date', '2020-11-30T12:34:56.789Z');
      request.setHeaders('host', 'localhost');
      request.setHeaders('digest', Crypto.digest(JSON.stringify({
        ballot,
      })));
      request.setHeaders(
        'authorization',
        `Signature keyId="${clientPublicKeyFingerprint}",algorithm="rsa-sha256",`
          + `headers="(request-target) host date digest",signature="${clientSignature}"`,
      );
      request.setBody({
        ballot,
      });
      const response = new ResponseMock();
      const controller = new BallotController(ballotRepo, keyRepo, crypto);

      // act
      const result = await controller.post(
        request as unknown as Request<unknown, BallotSubmissionResponse, BallotSubmissionRequest>,
        response as unknown as Response<BallotSubmissionResponse>,
      );

      // assert
      expect(result).toBe(response);
      expect(response.statusCode).toEqual(500);
      expect(response.body).toEqual({
        code: '500',
        message: 'There was a failure while submitting the ballot. It has NOT been submitted. '
          + 'Try again later.',
      });
    });
  });
});
