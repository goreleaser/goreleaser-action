import * as pro from '../src/pro';

describe('pro', () => {
  it('suffixes pro distribution', async () => {
    process.env.GORELEASER_KEY = 'fake-key';
    expect(pro.suffix()).toEqual('-pro');
  });
  it('does not suffix oss distribution', async () => {
    process.env.GORELEASER_KEY = '';
    expect(pro.suffix()).toEqual('');
  });
  it('gets pro distribution', async () => {
    process.env.GORELEASER_KEY = 'fake-key';
    expect(pro.distribution()).toEqual('goreleaser-pro');
  });
  it('gets oss distribution', async () => {
    process.env.GORELEASER_KEY = '';
    expect(pro.distribution()).toEqual('goreleaser');
  });
});
