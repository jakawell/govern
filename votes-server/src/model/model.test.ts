/**
 * @jest-environment jsdom
 */

import Substitute, { Arg, SubstituteOf } from '@fluffy-spoon/substitute';
import { ConnectionPool, IRecordSet, Request } from 'mssql';
import { Model } from './model';
import * as DataConnection from './dataConnection';

describe('Model: Base Model', () => {
  type TestModelSchema = {
    name: string;
    stuffQuantity: number;
    isCool: boolean;
    coolnessTime: Date;
  }

  function createMockPool(request: Request): SubstituteOf<ConnectionPool> {
    const mockPool = Substitute.for<ConnectionPool>();
    mockPool.request().returns(request);
    return mockPool;
  }

  it('creates a record', async () => {
    // arrange
    const mockRequest = Substitute.for<Request>();
    mockRequest.query(Arg.any('string')).resolves({
      output: {},
      recordset: [] as unknown as IRecordSet<unknown>,
      recordsets: [],
      rowsAffected: [1],
    });

    // act
    const result = await Model.create<TestModelSchema>({
      name: 'foo',
      stuffQuantity: 42,
      isCool: true,
      coolnessTime: new Date('2021-04-20T00:00:00.000Z'),
    }, 'TestModels', { customPool: createMockPool(mockRequest) });

    // assert
    expect(result).toBe(true);
    mockRequest.received(1).input('name_0', 'foo');
    mockRequest.received(1).input('stuffQuantity_0', 42);
    mockRequest.received(1).input('isCool_0', true);
    mockRequest.received(1).input('coolnessTime_0', new Date('2021-04-20T00:00:00.000Z'));
    mockRequest.received(1).query(
      'INSERT INTO TestModels (name, stuffQuantity, isCool, coolnessTime) '
      + 'VALUES (@name_0, @stuffQuantity_0, @isCool_0, @coolnessTime_0);',
    );
  });

  it('inserts multiple records', async () => {
    // arrange
    const mockRequest = Substitute.for<Request>();
    mockRequest.query(Arg.any('string')).resolves({
      output: {},
      recordset: [] as unknown as IRecordSet<unknown>,
      recordsets: [],
      rowsAffected: [3],
    });

    // act
    const result = await Model.insert<TestModelSchema>([
      {
        name: 'foo',
        stuffQuantity: 42,
        isCool: true,
        coolnessTime: new Date('2021-04-20T00:00:00.000Z'),
      },
      {
        name: 'bar',
        stuffQuantity: 69,
        isCool: false,
        coolnessTime: new Date('2021-03-17T04:00:00.000Z'),
      },
      {
        name: 'baz',
        stuffQuantity: -2,
        isCool: true,
        coolnessTime: new Date('2022-02-02T00:00:00.000Z'),
      },
    ], 'TestModels', { customPool: createMockPool(mockRequest) });

    // assert
    expect(result).toBe(3);
    mockRequest.received(1).input('name_0', 'foo');
    mockRequest.received(1).input('stuffQuantity_0', 42);
    mockRequest.received(1).input('isCool_0', true);
    mockRequest.received(1).input('coolnessTime_0', new Date('2021-04-20T00:00:00.000Z'));
    mockRequest.received(1).input('name_1', 'bar');
    mockRequest.received(1).input('stuffQuantity_1', 69);
    mockRequest.received(1).input('isCool_1', false);
    mockRequest.received(1).input('coolnessTime_1', new Date('2021-03-17T04:00:00.000Z'));
    mockRequest.received(1).input('name_2', 'baz');
    mockRequest.received(1).input('stuffQuantity_2', -2);
    mockRequest.received(1).input('isCool_2', true);
    mockRequest.received(1).input('coolnessTime_2', new Date('2022-02-02T00:00:00.000Z'));
    mockRequest.received(1).query(
      'INSERT INTO TestModels (name, stuffQuantity, isCool, coolnessTime) VALUES '
      + '(@name_0, @stuffQuantity_0, @isCool_0, @coolnessTime_0), '
      + '(@name_1, @stuffQuantity_1, @isCool_1, @coolnessTime_1), '
      + '(@name_2, @stuffQuantity_2, @isCool_2, @coolnessTime_2);',
    );
  });

  it('gracefully handles insertion of zero records', async () => {
    // arrange
    const mockRequest = Substitute.for<Request>();
    mockRequest.query(Arg.any('string')).rejects(new Error('Should not call the query.'));

    // act
    const result = await Model.insert<TestModelSchema>([], 'TestModels', { customPool: createMockPool(mockRequest) });

    // assert
    expect(result).toBe(0);
  });

  it('catches injection attacks on the table', async () => {
    // arrange
    const mockRequest = Substitute.for<Request>();

    // act/assert
    await expect(Model.create<TestModelSchema>({
      name: 'foo',
      stuffQuantity: 42,
      isCool: true,
      coolnessTime: new Date('2021-04-20T00:00:00.000Z'),
    }, 'Test@Models', { customPool: createMockPool(mockRequest) })).rejects.toThrowError(
      'Database query included unsanitary value. This could be a sign of a security breach.',
    );
  });

  it('uses data connection', async () => {
    // arrange
    const mockRequest = Substitute.for<Request>();
    mockRequest.query(Arg.any('string')).resolves({
      output: {},
      recordset: [] as unknown as IRecordSet<unknown>,
      recordsets: [],
      rowsAffected: [1],
    });
    const mockPool = Substitute.for<DataConnection.DataConnection>();
    mockPool.request().returns(mockRequest);
    DataConnection.DataConnection.getInstance = jest.fn(() => Promise.resolve(mockPool));

    // act
    const result = await Model.create<TestModelSchema>({
      name: 'foo',
      stuffQuantity: 42,
      isCool: true,
      coolnessTime: new Date('2021-04-20T00:00:00.000Z'),
    }, 'TestModels');

    // assert
    expect(result).toBe(true);
  });
});
