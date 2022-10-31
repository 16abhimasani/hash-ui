import { FC, ReactNode, useEffect, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import { useMeasure } from 'react-use';
import styled from 'styled-components';
import { useBreakPts } from '../../../hooks/useBreakPts';
import { PrimaryButton, SecondaryButton } from '../../button';
import { FlexEnds } from '../../flex';

export const PanelContainer = styled.div`
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 4px;
`;

export const PanelContentContainer = styled('div')`
  padding: 20px 24px;
`;

export const PanelLineSeparator = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(0, 0, 0, 0.15);
  margin: 28px 0 20px 0;
`;

export const PrimaryRowActionButton = styled(PrimaryButton)`
  display: block;
  width: 100%;
`;

export const SecondaryRowActionButton = styled(SecondaryButton)`
  display: block;
  width: 100%;
`;

const PanelAlwaysShowContainer = styled(FlexEnds)`
  padding: 20px 24px;
`;

const PanelExpandoContainer = styled(animated.div)`
  position: relative;
  will-change: transform, opacity, height;
  overflow: hidden;
`;

const PanelExpandoAbsoluteContainer = styled.div`
  position: absolute;
  width: 100%;
`;

const PanelExpandoContent = styled.div`
  padding: 8px 24px 20px 24px;
  width: 100%;
`;

const PanelTitle = styled.p`
  font-family: Helvetica;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  text-transform: uppercase;
  color: #808080;
  padding: 0;
  margin: 0;
`;

const ExpandPill = styled(PanelTitle)`
  background: #f8f8f8;
  border: 1px solid rgba(16, 16, 16, 0.1);
  box-sizing: border-box;
  border-radius: 9999px;
  padding: 4px 8px;
  cursor: pointer;
  :hover {
    background: #eeeeee;
  }
`;

export interface DetailsPanelProps {
  title: string;
  children?: ReactNode;
  defaultIsExpanded?: boolean;
}

export const DetailsPanel: FC<DetailsPanelProps> = ({
  title,
  children,
  defaultIsExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const [expandoContentRef, expandoContentBounds] = useMeasure();

  const { height, opacity } = useSpring({
    from: { height: 0, opacity: 0 },
    to: {
      height: isExpanded ? expandoContentBounds.height : 0,
      opacity: isExpanded ? 1 : 0,
    },
  });

  const breakPoint = useBreakPts();
  useEffect(() => {
    if (breakPoint == 'SM' || breakPoint == 'MD') {
      setIsExpanded(false);
    }
  }, [breakPoint, setIsExpanded]);

  return (
    <PanelContainer>
      <PanelAlwaysShowContainer>
        <PanelTitle>{title}</PanelTitle>
        <ExpandPill onClick={() => setIsExpanded((s) => !s)}>
          {isExpanded ? 'Collapse' : 'Expand'}
        </ExpandPill>
      </PanelAlwaysShowContainer>
      <PanelExpandoContainer style={{ opacity, height }}>
        <PanelExpandoAbsoluteContainer ref={expandoContentRef as any}>
          <PanelExpandoContent>{children}</PanelExpandoContent>
        </PanelExpandoAbsoluteContainer>
      </PanelExpandoContainer>
    </PanelContainer>
  );
};
