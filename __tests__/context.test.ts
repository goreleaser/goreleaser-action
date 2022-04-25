import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import * as os from 'os';
import * as context from '../src/context';

describe('setOutput', () => {
  beforeEach(() => {
    process.stdout.write = jest.fn() as typeof process.stdout.write;
  });

  // eslint-disable-next-line jest/expect-expect
  it('setOutput produces the correct command', () => {
    context.setOutput('some output', 'some value');
    assertWriteCalls([`::set-output name=some output::some value${os.EOL}`]);
  });

  // eslint-disable-next-line jest/expect-expect
  it('setOutput handles bools', () => {
    context.setOutput('some output', false);
    assertWriteCalls([`::set-output name=some output::false${os.EOL}`]);
  });

  // eslint-disable-next-line jest/expect-expect
  it('setOutput handles numbers', () => {
    context.setOutput('some output', 1.01);
    assertWriteCalls([`::set-output name=some output::1.01${os.EOL}`]);
  });
});

// Assert that process.stdout.write calls called only with the given arguments.
function assertWriteCalls(calls: string[]): void {
  expect(process.stdout.write).toHaveBeenCalledTimes(calls.length);
  for (let i = 0; i < calls.length; i++) {
    expect(process.stdout.write).toHaveBeenNthCalledWith(i + 1, calls[i]);
  }
}
