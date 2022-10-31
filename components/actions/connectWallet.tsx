import { FC } from 'react';
import { useModalStore } from '../../stores/modal';
import {
  PanelLineSeparator,
  SecondaryRowActionButton,
} from '../art/panels/panel';
import {
  ActionDescription,
  ActionSmallContentContainer,
  ActionSmallContentWrapper,
  ActionTitle,
} from './common';

export interface SuccessActionProps {
  title: string;
  description: string;
  buttonText?: string;
}

export const ConnectWalletAction: FC<SuccessActionProps> = ({
  title,
  description,
}) => {
  const toggleIsOpen = useModalStore((s) => s.toggleIsWalletModalOpen);
  return (
    <ActionSmallContentWrapper>
      <ActionSmallContentContainer>
        <ActionTitle style={{ textAlign: 'center' }}>{title}</ActionTitle>
        <ActionDescription style={{ textAlign: 'center', marginTop: 24 }}>
          {description}
        </ActionDescription>
        <PanelLineSeparator />
        <SecondaryRowActionButton onClick={toggleIsOpen}>
          Connect Wallet
        </SecondaryRowActionButton>
      </ActionSmallContentContainer>
    </ActionSmallContentWrapper>
  );
};
