import { CURRENT_SEASON, Season } from '@hash/seasons';
import { ROUTES } from '../constants/routes';

export const prerenderWithFailsafeFetcher = async (
  season: Season = CURRENT_SEASON,
  txHash: string,
) => {
  const result = await fetch(
    `${ROUTES.API.PRERENDER}/${season}?hash=${txHash}`,
  );

  if (result.status === 200) {
    return await result.clone().json();
  }

  if (result.status === 404) {
    return null;
  }
};

export const fetcher = async (endPt: string) => {
  const res = await fetch(endPt);
  if (res.ok) {
    return await res.json();
  }
  return undefined;
};

export const graphQlFetcher = async (url: string, query: string) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    throw new Error(`Graph QL response for ${url} is not ok.`);
  }
  return (await res.json()).data;
};
