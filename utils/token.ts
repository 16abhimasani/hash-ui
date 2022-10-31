import { getSeasonFromTokenId, TOKEN_TYPE_TO_MAX_SUPPLY } from '@hash/seasons';

export const getEditionFromGenesisTokenId = (tokenId: string) => {
  return (
    parseInt(tokenId.slice(34), 16) +
    ('0x8000000000000000000000000000000200000000000000000000000000000000'.slice(
      0,
      34,
    ) === tokenId.slice(0, 34)
      ? TOKEN_TYPE_TO_MAX_SUPPLY[
          '0x8000000000000000000000000000000100000000000000000000000000000000'
        ]
      : 0)
  );
};

export const getEditionFromTokenId = (tokenId: string) => {
  const season = getSeasonFromTokenId(tokenId);
  // There is some weird tokenId nuance with season 0, so need to route to a specfic util
  if (season === 'genesis') {
    return getEditionFromGenesisTokenId(tokenId);
  }
  return parseInt(tokenId.slice(34), 16);
};

export const getTokenTypeFromTokenId = (tokenId: string) => {
  return tokenId.slice(0, 34) + '00000000000000000000000000000000';
};
