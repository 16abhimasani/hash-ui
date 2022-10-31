import produce from 'immer';
import create from 'zustand';

export const COLLECTION_TX_HASHES_MAP: { [collection: string]: string[] } = {
  '0x': [],
  'hash': [],
  'deja-vu': [],
  'defi': [],
  'xcopy': [],
  'eye-candy': [],
  'mint-fund': [],
  'bayc': [],
  'coinbase': [],
  'uniswap': [],
  'cryptopunk-aliens': [],
  'test': [],
  'beeple': [],
  'genesis-latest-minted': [],
  'euler-beats-genesis': [],
};

type State = {
  collectionHashesMap: { [id: string]: string[] };
  updateCollectionHashesMap: (updateFn: (update: any) => void) => void;
};

export const useCollectionsStore = create<State>((set, get) => ({
  collectionHashesMap: COLLECTION_TX_HASHES_MAP,
  updateCollectionHashesMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.collectionHashesMap);
      }),
    );
  },
}));
