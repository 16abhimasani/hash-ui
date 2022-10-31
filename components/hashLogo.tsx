import styled from 'styled-components';

const IconImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1eff27;
  height: 48px;
  width: 48px;
  border-radius: 999px;
`;

const IconImage = styled.img`
  width: 40px;
  height: 40px;
  display: block;
  object-fit: contain;
  object-position: center;
`;

export const HashLogo = () => {
  return (
    <IconImageWrapper>
      <IconImage src={'/assets/logos/hash.png'} />{' '}
    </IconImageWrapper>
  );
};
