export const getSagaMinterTypeFromTokenId = (
  tokenId: string,
): string | undefined => {
  const tokenTypePrefixFromTokenId = tokenId.slice(0, 34);
  if (
    tokenTypePrefixFromTokenId ===
    '0x8000000000000000000000000000000300000000000000000000000000000000'.slice(
      0,
      34,
    )
  ) {
    return 'personal';
  }
  if (
    tokenTypePrefixFromTokenId ===
    '0x8000000000000000000000000000000400000000000000000000000000000000'.slice(
      0,
      34,
    )
  ) {
    return 'historic';
  }
  if (
    tokenTypePrefixFromTokenId ===
    '0x8000000000000000000000000000000500000000000000000000000000000000'.slice(
      0,
      34,
    )
  ) {
    return 'grant';
  }
  return undefined;
};
