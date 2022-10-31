import { Season, SEASON_TO_ART_FACTORY, SEASON_TO_NUM } from '@hash/seasons';
import { mulVec2 } from '@hash/sketch-utils';
import { DIMENSIONS } from '@hash/types';
import { BigNumber } from 'ethers';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import React, { useMemo } from 'react';
import { Canvas } from '../../../../components/render/canvas';
import {
  CanvasWrapper,
  MintedArtSignature,
} from '../../../../components/render/common';
import { ZERO } from '../../../../constants';
import { ROUTES } from '../../../../constants/routes';
import { getHttpProtocol } from '../../../../utils';
import { hashRegistryCached } from '../../../../utils/hash-registry';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, multiplier, season } = context.query;

  if (
    !season ||
    typeof season !== 'string' ||
    (SEASON_TO_NUM as any)[season] === undefined
  ) {
    return {
      notFound: true,
    };
  }

  if (!id) {
    return {
      notFound: true,
    };
  }
  const hash = await hashRegistryCached.tokenIdToTxHash(id as string);
  if (hash.eq(ZERO)) {
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
        tokenId: BigNumber.from(id).toHexString(),
        multiplier: isNaN(parseInt(multiplier as string))
          ? 1
          : parseInt(multiplier as string) / 100,
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
  const scaledDimensions = useMemo(() => {
    return mulVec2(DIMENSIONS, [payload.multiplier, payload.multiplier]);
  }, [payload.multiplier]);
  return (
    <CanvasWrapper dimensions={scaledDimensions}>
      <Canvas
        prerenderPayload={payload}
        artFactory={SEASON_TO_ART_FACTORY[payload.season as Season]}
        dimensions={DIMENSIONS}
      />
      <MintedArtSignature
        src={'/sig-white.svg'}
        multiplier={payload.multiplier}
      />
    </CanvasWrapper>
  );
};

export default React.memo(PreviewPage);
