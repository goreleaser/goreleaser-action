import * as pro from '../src/pro';

describe('pro', () => {
  it('suffixes pro distribution', async () => {
    process.env.GORELEASER_CURRENT_TAG = 'fake-key';
    expect(pro.suffix()).toEqual('-pro');
  });
  it('does not suffix oss distribution', async () => {
    process.env.GORELEASER_CURRENT_TAG = '';
    expect(pro.suffix()).toEqual('');
  });
  it('gets pro distribution', async () => {
    process.env.GORELEASER_CURRENT_TAG = 'fake-key';
    expect(pro.distribution()).toEqual('goreleaser-pro');
  });
  it('gets oss distribution', async () => {
    process.env.GORELEASER_CURRENT_TAG = '';
    expect(pro.distribution()).toEqual('goreleaser');
  });
});
