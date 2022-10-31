import { FC } from 'react';
import { useSetTagManagerActionStateByContext } from '../../../contexts/tagsManager';
import {
  ActionDescription,
  ActionSmallContentContainer,
  ActionSmallContentWrapper,
  ActionTitle,
} from '../../actions/common';
import {
  PanelLineSeparator,
  SecondaryRowActionButton,
} from '../../art/panels/panel';

export const IntroState: FC = () => {
  const setActionState = useSetTagManagerActionStateByContext();
  return (
    <ActionSmallContentWrapper>
      <ActionSmallContentContainer>
        <ActionTitle>Create and manage tags</ActionTitle>
        <ActionDescription style={{ marginTop: 24 }}>
          Tags are automatically assigned to a HASH based on rules specified by
          historians.
        </ActionDescription>
        <ActionDescription style={{ marginTop: 24 }}>
          <strong>NOTE:</strong> Tags are applied globally to all HASH NFTs.
          Doublecheck that the tags you are editing or creating are accurate.
        </ActionDescription>
        <PanelLineSeparator />
        <SecondaryRowActionButton
          onClick={() => setActionState?.('learn-more')}
        >
          Learn More
        </SecondaryRowActionButton>
      </ActionSmallContentContainer>
    </ActionSmallContentWrapper>
  );
};
