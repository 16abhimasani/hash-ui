import { TOKEN_TYPE_TO_PRICING_FUNCTION } from '@hash/seasons';
import { getEditionFromTokenId, getTokenTypeFromTokenId } from '../utils/token';

export const getMintPrice = (tokenId: string) => {
  const tokenType = getTokenTypeFromTokenId(tokenId);

  const pricingFunction = TOKEN_TYPE_TO_PRICING_FUNCTION[tokenType];

  if (!!pricingFunction) {
    return pricingFunction(getEditionFromTokenId(tokenId));
  }

  return undefined;
};
