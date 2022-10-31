import { BigNumber } from '@ethersproject/bignumber';
import produce from 'immer';
import create from 'zustand';

export type State = {
  carouselIndexMap: { [id: string]: number };
  valuesMap: { [id: string]: any[] };
  getCarousel: (id: string) => () => ({ key: string; value: any } | null)[];
  incrementCarouselIndex: (id: string) => () => void;
  decrementCarouselIndex: (id: string) => () => void;
  setCarouselIndex: (id: string) => (newCarouselIndex: number) => void;
  setValues: (id: string) => (values: any[]) => void;
  updateCarouselIndexMap: (updateFn: (update: any) => void) => void;
  updateValuesMap: (updateFn: (update: any) => void) => void;
};

export const CAROUSEL_CARD_STATE_LIFECYCLE: CarouselCardState[] = [
  'prefetch-left',
  'side-left',
  'center',
  'side-right',
  'prefetch-right',
];

export type CarouselCardState =
  | 'prefetch-left'
  | 'prefetch-right'
  | 'side-left'
  | 'side-right'
  | 'center';

export interface CarouselRichMetadataBase {
  id: string;
}

export interface CustomCarouselData extends CarouselRichMetadataBase {
  asset: string;
  title: string;
  description: string;
  linkLabel: string;
  linkHref: string;
  shareHref: string;
  price: BigNumber;
  priceHref: string;
  type: 'custom';
}

export interface HashCarouselData extends CarouselRichMetadataBase {
  asset?: string;
  type: 'hash';
  title?: string;
  description?: string;
}

export type CarouselData = HashCarouselData | CustomCarouselData;

export const useCarouselStore = create<State>((set, get) => ({
  carouselIndexMap: {},
  valuesMap: {},
  getCarousel: (id: string) => () => {
    const { carouselIndexMap, valuesMap } = get();
    const carouselIndex = carouselIndexMap[id] ?? 0;
    const values = valuesMap[id] ?? [];
    return [
      !!values[carouselIndex - 2]
        ? {
            key: `${values[carouselIndex - 2]}-${carouselIndex - 2}`,
            value: values[carouselIndex - 2],
          }
        : null,
      !!values[carouselIndex - 1]
        ? {
            key: `${values[carouselIndex - 1]}-${carouselIndex - 1}`,
            value: values[carouselIndex - 1],
          }
        : null,
      !!values[carouselIndex - 0]
        ? {
            key: `${values[carouselIndex - 0]}-${carouselIndex - 0}`,
            value: values[carouselIndex - 0],
          }
        : null,
      !!values[carouselIndex + 1]
        ? {
            key: `${values[carouselIndex + 1]}-${carouselIndex + 1}`,
            value: values[carouselIndex + 1],
          }
        : null,
      !!values[carouselIndex + 2]
        ? {
            key: `${values[carouselIndex + 2]}-${carouselIndex + 2}`,
            value: values[carouselIndex + 2],
          }
        : null,
    ];
  },
  incrementCarouselIndex: (id: string) => () => {
    const { updateCarouselIndexMap, valuesMap } = get();
    updateCarouselIndexMap((u) => {
      if (!u[id]) {
        u[id] = 0;
      }
      u[id] = u[id] === valuesMap[id].length - 1 ? u[id] : u[id] + 1;
    });
  },
  decrementCarouselIndex: (id: string) => () => {
    get().updateCarouselIndexMap((u) => {
      if (!u[id]) {
        u[id] = 0;
      }
      u[id] = u[id] === 0 ? u[id] : u[id] - 1;
    });
  },
  setValues: (id: string) => (values: any[]) => {
    get().updateValuesMap((u) => {
      if (!u[id]) {
        u[id] = [];
      }
      u[id] = values;
    });
  },
  setCarouselIndex: (id: string) => (carouselIndex: number) => {
    get().updateCarouselIndexMap((u) => {
      u[id] = carouselIndex;
    });
  },
  updateCarouselIndexMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.carouselIndexMap);
      }),
    );
  },
  updateValuesMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.valuesMap);
      }),
    );
  },
}));
