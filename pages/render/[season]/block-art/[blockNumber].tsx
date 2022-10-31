import { Season, SEASON_TO_ART_FACTORY, SEASON_TO_NUM } from '@hash/seasons';
import { DIMENSIONS } from '@hash/types';
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next';
import React from 'react';
import styled from 'styled-components';
import { PROVIDER } from '../../../../clients/provider';
import { Canvas } from '../../../../components/render/canvas';
import { CanvasWrapper } from '../../../../components/render/common';
import { ROUTES } from '../../../../constants/routes';
import { getHttpProtocol } from '../../../../utils';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { blockNumber, season } = context.query;
  console.log(blockNumber, season, (SEASON_TO_NUM as any)[season as string]);

  if (
    !season ||
    typeof season !== 'string' ||
    (SEASON_TO_NUM as any)[season] === undefined
  ) {
    return {
      notFound: true,
    };
  }

  if (
    !blockNumber ||
    typeof blockNumber !== 'string' ||
    parseInt(blockNumber) === NaN
  ) {
    return {
      notFound: true,
    };
  }

  const blockDetails = await PROVIDER.getBlock(parseInt(blockNumber));

  const transactions = blockDetails.transactions;

  console.log(transactions);

  const results = (
    await Promise.all(
      transactions.map((t) =>
        fetch(
          `${getHttpProtocol()}://${process.env.VERCEL_URL}${
            ROUTES.API.PRERENDER
          }/${season}?hash=${t}`,
        ),
      ),
    )
  ).filter((r) => r.ok);

  const prerenderPayloads = await Promise.all(results.map((r) => r.json()));

  if (results.length !== 0) {
    return {
      props: {
        prerenderPayloads,
        season,
      },
    };
  }

  return {
    notFound: true,
  };
};

const CanvasGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

const PreviewPage: NextPage = (
  payload: InferGetServerSidePropsType<typeof getServerSideProps>,
) => {
  return (
    <CanvasGrid>
      {payload.prerenderPayloads.map((payload: any) => (
        <CanvasWrapper key={payload.gene.seed} dimensions={DIMENSIONS}>
          <Canvas
            prerenderPayload={payload}
            artFactory={SEASON_TO_ART_FACTORY[payload.season as Season]}
            dimensions={DIMENSIONS}
          />
        </CanvasWrapper>
      ))}
    </CanvasGrid>
  );
};

export default React.memo(PreviewPage);
