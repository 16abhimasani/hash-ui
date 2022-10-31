import { FC } from 'react';
import { useTokenIdByContext } from '../../../contexts/token';
import { MintedPanel } from './mintedPanel';
import { MintingPanel } from './mintingPanel';

export const TokenStatePanel: FC<{
  setIsBidOpen: (b: boolean) => void;
  setIsListOpen: (b: boolean) => void;
  setIsMigrateOpen: (b: boolean) => void;
  setIsLowerOpen: (b: boolean) => void;
}> = ({ setIsLowerOpen, setIsBidOpen, setIsMigrateOpen, setIsListOpen }) => {
  const tokenId = useTokenIdByContext();

  console.log(tokenId);

  if (tokenId === null) {
    return <MintingPanel />;
  }

  if (!!tokenId) {
    return (
      <MintedPanel
        setIsBidOpen={setIsBidOpen}
        setIsLowerOpen={setIsLowerOpen}
        setIsListOpen={setIsListOpen}
        setIsMigrateOpen={setIsMigrateOpen}
      />
    );
  }
  return null;
};
