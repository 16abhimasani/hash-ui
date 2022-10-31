import produce from 'immer';
import create from 'zustand';

type State = {
  tokenTypeToSupply: { [tokenType: string]: number };
  setSupply: (tokenType: string, supply: number) => void;
};

export const useSeasonStore = create<State>((set) => ({
  tokenTypeToSupply: {},
  setSupply: (tokenType: string, supply: number) => {
    set(
      produce((update) => {
        update.tokenTypeToSupply[tokenType] = supply;
      }),
    );
  },
}));
