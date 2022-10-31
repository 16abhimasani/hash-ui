import { FC, useMemo } from 'react';
import {
  NFT_LICENSE_LINK,
  WHAT_IS_ALL_NONSENSE_LINK,
  WHAT_IS_ALL_NONSENSE_LINK_HUNT,
  WHAT_IS_ALL_NONSENSE_LINK_SAGA,
} from '../../../constants';
import { usePreferredSeasonByContext } from '../../../contexts/token';
import { SecondaryTextAnchor } from '../../anchor';
import { FlexEnds } from '../../flex';

export const LicenseFooter: FC<{ faqLink?: string }> = ({ faqLink }) => {
  const preferredSeason = usePreferredSeasonByContext();

  const defaultFaqLink = useMemo(() => {
    if (preferredSeason === 'genesis') {
      return WHAT_IS_ALL_NONSENSE_LINK;
    }
    if (preferredSeason === 'saga') {
      return WHAT_IS_ALL_NONSENSE_LINK_SAGA;
    }
    if (preferredSeason === 'hunt') {
      return WHAT_IS_ALL_NONSENSE_LINK_HUNT;
    }
    return undefined;
  }, [preferredSeason]);

  return (
    <FlexEnds>
      <SecondaryTextAnchor href={NFT_LICENSE_LINK} target={'_blank'}>
        License
      </SecondaryTextAnchor>
      <SecondaryTextAnchor href={defaultFaqLink ?? faqLink} target={'_blank'}>
        FAQ
      </SecondaryTextAnchor>
    </FlexEnds>
  );
};
