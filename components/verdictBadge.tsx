import { FC } from 'react';
import styled from 'styled-components';
import { OpinionType, OPINION_TYPE_TO_EMOJI } from '../types/verdict';
import { Flex } from './flex';

const BadgeWell = styled(Flex)`
  background: black;
  padding: 8px 12px 8px 10px;
  height: 26px;
  border-radius: 999px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15);
`;

const BadgeLabel = styled.p`
  margin: 0;
  font-size: 10px;
  text-transform: capitalize;
  line-height: 10px;
  /* font-weight: bold; */
  color: rgba(255, 255, 255, 1);
`;

const BadgeEmojiLabel = styled(BadgeLabel)`
  margin-right: 5px;
`;

export const VerdictBadge: FC<{ opinion: OpinionType }> = ({ opinion }) => {
  return (
    <BadgeWell>
      <BadgeEmojiLabel>{OPINION_TYPE_TO_EMOJI[opinion]}</BadgeEmojiLabel>
      <BadgeLabel>{opinion}</BadgeLabel>
    </BadgeWell>
  );
};
