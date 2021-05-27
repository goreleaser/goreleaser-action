import * as pro from '../src/pro';

describe('pro', () => {
  it('suffixes pro distribution', async () => {
    expect(pro.suffix('goreleaser-pro')).toEqual('-pro');
  });
  it('does not suffix oss distribution', async () => {
    expect(pro.suffix('goreleaser')).toEqual('');
  });
});
