import { FC } from 'react';
import { usePreferredSeasonByContext } from '../../../../contexts/token';
import { DetailsPanel } from '../panel';
import { GenesisMetadata } from './genesis';
import { HuntMetadata } from './hunt';
import { SagaMetadata } from './saga';

export const MetadataDetailsPanel: FC = () => {
  const preferredSeason = usePreferredSeasonByContext();

  return (
    <DetailsPanel title={'Details'} defaultIsExpanded={true}>
      <>
        {preferredSeason === 'genesis' && <GenesisMetadata />}
        {preferredSeason === 'saga' && <SagaMetadata />}
        {preferredSeason === 'hunt' && <HuntMetadata />}
      </>
    </DetailsPanel>
  );
};
