import { foo } from '.';

describe('Index', () => {
  test('foo returns "Hello World"', () => {
    // act
    const result = foo();
    // assert
    expect(result).toEqual('Hello world!');
  });
});
