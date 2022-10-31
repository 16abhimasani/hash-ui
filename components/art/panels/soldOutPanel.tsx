import { FC } from 'react';
import { TWITTER_LINK } from '../../../constants';
import { Flex } from '../../flex';
import { Label } from '../../text';
import {
  PanelContainer,
  PanelContentContainer,
  PanelLineSeparator,
  PrimaryRowActionButton,
} from './panel';

export const SoldOutPanel: FC = () => {
  return (
    <PanelContainer>
      <PanelContentContainer>
        <Flex>
          <Label style={{ fontSize: 14, textTransform: 'none' }}>
            Minting is over. Follow{' '}
            <a
              href={TWITTER_LINK}
              target={'_blank'}
              style={{ color: 'inherit' }}
            >
              @prrfbeauty
            </a>{' '}
            for the next season.
          </Label>
        </Flex>
        <PanelLineSeparator />
        <PrimaryRowActionButton disabled>Sold Out</PrimaryRowActionButton>
      </PanelContentContainer>
    </PanelContainer>
  );
};
