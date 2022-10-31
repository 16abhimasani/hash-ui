import styled from 'styled-components';
import { SecondaryButton } from '../button';
import { FlexCenterColumn } from '../flex';
import { Text } from '../text';

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
}> = ({ title, description, actionText, onActionClick }) => {
  return (
    <StateContainer>
      <StateText style={{ color: 'black', fontWeight: 'bold' }}>
        {title}
      </StateText>
      <StateText style={{ width: 240, marginTop: 12, lineHeight: '20px' }}>
        {description}
      </StateText>
      {!!onActionClick && (
        <SecondaryButton
          style={{ height: 'auto', padding: '16px 20px', marginTop: 12 }}
          onClick={onActionClick}
        >
          {actionText}
        </SecondaryButton>
      )}
    </StateContainer>
  );
};

const StateText = styled(Text)`
  font-size: 14px;
`;

const StateContainer = styled(FlexCenterColumn)`
  margin: 200px 0;
  text-align: center;
`;
