import Link from 'next/link';
import { FC } from 'react';
import { ROUTES } from '../../constants/routes';
import { useHashByContext } from '../../contexts/token';
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

export const SuccessAction: FC<SuccessActionProps> = ({
  title,
  description,
  buttonText,
}) => {
  const hash = useHashByContext();
  return (
    <ActionSmallContentWrapper>
      <ActionSmallContentContainer>
        <ActionTitle style={{ textAlign: 'center' }}>{title}</ActionTitle>
        <ActionDescription style={{ textAlign: 'center', marginTop: 24 }}>
          {description}
        </ActionDescription>
        <PanelLineSeparator />
        <Link href={`${ROUTES.ART.INDEX}/${hash ?? '#'}`} passHref>
          <SecondaryRowActionButton
            as={'a'}
            style={{ textDecoration: 'none', color: 'black' }}
          >
            {buttonText ?? 'Go back to asset page'}
          </SecondaryRowActionButton>
        </Link>
      </ActionSmallContentContainer>
    </ActionSmallContentWrapper>
  );
};
