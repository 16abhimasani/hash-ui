import { Season, SEASON_TO_ART_FACTORY, SEASON_TO_NUM } from '@hash/seasons';
import { DIMENSIONS } from '@hash/types';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import React from 'react';
import { Canvas } from '../../../../components/render/canvas';
import { CanvasWrapper } from '../../../../components/render/common';
import { ROUTES } from '../../../../constants/routes';
import { getHttpProtocol } from '../../../../utils';
import { TX_HASH_REGEX } from '../../../../utils/regex';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { hash, season } = context.query;
  console.log(hash, season, (SEASON_TO_NUM as any)[season as string]);

  if (
    !season ||
    typeof season !== 'string' ||
    (SEASON_TO_NUM as any)[season] === undefined
  ) {
    return {
      notFound: true,
    };
  }

  if (!hash || typeof hash !== 'string' || !TX_HASH_REGEX.test(hash)) {
    return {
      notFound: true,
    };
  }

  const result = await fetch(
    `${getHttpProtocol()}://${process.env.VERCEL_URL}${
      ROUTES.API.PRERENDER
    }/${season}?hash=${hash}`,
  );

  if (result.status === 200) {
    return {
      props: {
        ...(await result.json()),
        hash,
        season,
      },
    };
  }

  return {
    notFound: true,
  };
};

const PreviewPage: NextPage = (
  payload: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  return (
    <CanvasWrapper dimensions={DIMENSIONS}>
      <Canvas
        prerenderPayload={payload}
        artFactory={SEASON_TO_ART_FACTORY[payload.season as Season]}
        dimensions={DIMENSIONS}
      />
    </CanvasWrapper>
  );
};

export default React.memo(PreviewPage);
