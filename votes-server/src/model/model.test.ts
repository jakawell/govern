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

  // class TestModel implements Model<TestModelSchema> {
  //   public static modelName = 'TestModels';
  // }

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
    expect(result).toBe(1);
    mockRequest.received(1).input('input0', 'foo');
    mockRequest.received(1).input('input1', 42);
    mockRequest.received(1).input('input2', true);
    mockRequest.received(1).input('input3', new Date('2021-04-20T00:00:00.000Z'));
    mockRequest.received(1).query(
      'INSERT INTO TestModels (name, stuffQuantity, isCool, coolnessTime) VALUES (@input0, @input1, @input2, @input3);',
    );
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
    expect(result).toBe(1);
  });
});
