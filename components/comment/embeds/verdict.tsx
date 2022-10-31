import { FC } from 'react';
import styled from 'styled-components';
import { VerdictEmbedMetadata } from '../../../types/comments';
import { Flex } from '../../flex';
import { Tag } from '../../tag';

const VerdictLabel = styled.p`
  font-weight: bold;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  margin: 0;
`;

export const VerdictEmbed: FC<VerdictEmbedMetadata> = ({ opinionType }) => {
  return (
    <Flex>
      <VerdictLabel style={{ marginRight: 12 }}>Verdict:</VerdictLabel>
      {opinionType === 'verified' && <Tag>✅-verified</Tag>}
      {opinionType === 'disputed' && <Tag>🚫-disputed</Tag>}
    </Flex>
  );
};
