import { GetServerSideProps, NextPage } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const reconstructedUrl = `/${(
    (context.params?.hashParams as string[]) ?? []
  ).join('/')}`;
  return {
    redirect: {
      destination: reconstructedUrl,
      permanent: true,
    },
  };
};

const HashRedirectPage: NextPage = () => {
  return <></>;
};

export default React.memo(HashRedirectPage);
