export const distribution = (): string => {
  return 'goreleaser' + suffix();
};

export const suffix = (): string => {
  return isPro() ? '-pro' : '';
};

export const isPro = (): boolean => {
  return process.env.GORELEASER_KEY !== '';
};
