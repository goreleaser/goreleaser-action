export const suffix = (distribution: string): string => {
  return isPro(distribution) ? '-pro' : '';
};

export const isPro = (distribution: string): boolean => {
  return distribution === 'goreleaser-pro';
};
