import { FC, useMemo } from 'react';
import styled from 'styled-components';

export const Tag: FC<{
  children: any;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => {
  const isEmphasized = useMemo(
    () => children === '🚫-disputed' || children === '✅-verified',
    [children],
  );

  if (isEmphasized) {
    return (
      <EmphasizedTagContainer onClick={onClick} className={className}>
        {children}
      </EmphasizedTagContainer>
    );
  }
  return (
    <TagContainer onClick={onClick} className={className}>
      {children}
    </TagContainer>
  );
};

export const TagContainer = styled.div`
  text-decoration: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  width: fit-content;
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 10px 16px 9px;
  font-family: Helvetica;
  font-style: normal;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.4);
  height: 34px;
  border: 1px solid rgba(17, 10, 10, 0.2);
`;

export const EmphasizedTagContainer = styled(TagContainer)`
  background: black;
  color: white;
  /* box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.15); */
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;
