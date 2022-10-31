export const getBlockNumFromStoreWithDelay = (s: any, delay = 2) =>
  !!s.blockNumber ? s.blockNumber - delay : undefined;
