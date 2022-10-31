import { FC } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { fb } from '../../../clients/firebase-app';
import { STUDIO_PROD_LINK } from '../../../constants';
import { useSetTagManagerActionStateByContext } from '../../../contexts/tagsManager';
import { useUser } from '../../../hooks/useUser';
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

const StyledUl = styled.ul`
  > li + li {
    margin-top: 8px;
  }
`;

const auth = fb.auth();

export const LearnMoreState: FC = () => {
  const setActionState = useSetTagManagerActionStateByContext();
  const [currentUser] = useAuthState(auth);
  const { roles } = useUser(currentUser?.uid) ?? {};

  return (
    <ActionSmallContentWrapper>
      <ActionSmallContentContainer>
        <ActionTitle>Diving into tags</ActionTitle>
        <ActionDescription style={{ marginTop: 24 }}>
          Tags are a powerful way to label and index ETH history. Instead of
          manually labeling each txn, HASH relies on rule based systems
          configured by historians and POB studios. There are{' '}
          <strong>four</strong> kind of tags:
        </ActionDescription>
        <StyledUl>
          <li>
            <ActionDescription>
              <strong>Automatic tags </strong> are custom created by{' '}
              <a href={STUDIO_PROD_LINK} style={{ color: 'black' }}>
                POB studios
              </a>{' '}
              to cover unique tags that the other tag types can't support.
            </ActionDescription>
          </li>
          <li>
            <ActionDescription>
              <strong>Known contracts tags</strong> are used to label txns based
              on the txn sender, receiver, and event emitters.
            </ActionDescription>
          </li>
          <li>
            <ActionDescription>
              <strong>Event match tags</strong> are used to label txns based on
              the events emitted in the txn.
            </ActionDescription>
          </li>
          <li>
            <ActionDescription>
              <strong>Tab groups</strong> are higher-level tags that are
              composites of <strong>Known contracts tags</strong> +{' '}
              <strong>Automatic tags </strong> +{' '}
              <strong>Event match tags</strong>. Only if all the composited tags
              are matched will a tab group be added.
            </ActionDescription>
          </li>
        </StyledUl>
        <ActionDescription style={{ marginTop: 24 }}>
          Click on any tag to learn more about it.
        </ActionDescription>
        {roles?.historian && (
          <>
            <PanelLineSeparator />
            <SecondaryRowActionButton
              onClick={() =>
                setActionState?.('create-contract-interaction-tag')
              }
            >
              Create a KNOWN CONTRACT TAG
            </SecondaryRowActionButton>
            <SecondaryRowActionButton
              style={{ marginTop: 20 }}
              onClick={() => setActionState?.('create-tag-group-tag')}
            >
              Create a Tag Group TAG
            </SecondaryRowActionButton>
          </>
        )}
      </ActionSmallContentContainer>
    </ActionSmallContentWrapper>
  );
};
