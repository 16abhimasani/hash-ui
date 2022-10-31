import { getContrast } from 'polished';
import { FC } from 'react';
import styled from 'styled-components';
import { DetailsTableLabelAnchor, DetailsTableRowContainer } from '..';
import { ROUTES } from '../../../../constants/routes';
import { useContractName } from '../../../../hooks/useContractName';
import { BREAKPTS } from '../../../../styles';
import { shortenHexString } from '../../../../utils/hex';

const DetailsColorCircle = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${(props) => props.color};
  border: ${(p) =>
    getContrast(p.color, '#FFFFFF') <= 1.1 ? '1px solid #000' : 'none'};
`;

const DetailsColorPalleteWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  div + div {
    margin-left: 6px;
  }
  @media (max-width: ${BREAKPTS.SM}px) {
    justify-content: flex-start;
  }
`;

const ColorPalleteDetailsTableContainer = styled(DetailsTableRowContainer)`
  padding: 14px 16px;
`;

export const ColorPallete: FC<{ address: string; palette: string[] }> = ({
  address,
  palette,
}) => {
  const contractName = useContractName(address);
  return (
    <ColorPalleteDetailsTableContainer
      as={'a'}
      href={`${ROUTES.PALETTE}/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      hover
    >
      <DetailsTableLabelAnchor
        as={'p'}
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {contractName?.slice(0, 18) ?? shortenHexString(address)}
      </DetailsTableLabelAnchor>
      <DetailsColorPalleteWrapper>
        {palette.map((c: string) => (
          <DetailsColorCircle key={`${address}-color-circle-${c}`} color={c} />
        ))}
      </DetailsColorPalleteWrapper>
    </ColorPalleteDetailsTableContainer>
  );
};
