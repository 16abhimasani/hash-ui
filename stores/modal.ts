import create from 'zustand';

type State = {
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (s: boolean) => void;
  toggleIsSearchModalOpen: () => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (s: boolean) => void;
  toggleIsWalletModalOpen: () => void;
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (s: boolean) => void;
  toggleIsMenuModalOpen: () => void;
  isTwitterModalOpen: boolean;
  setIsTwitterModalOpen: (s: boolean) => void;
  toggleIsTwitterModalOpen: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (s: boolean) => void;
  toggleIsLoginModalOpen: () => void;
  isApproveModalOpen: boolean;
  setIsApproveModalOpen: (s: boolean) => void;
  toggleIsApproveModalOpen: () => void;
};

export const useModalStore = create<State>((set, get) => ({
  isSearchModalOpen: false,
  setIsSearchModalOpen: (s) => set({ isSearchModalOpen: s }),
  toggleIsSearchModalOpen: () =>
    set((s) => ({
      isSearchModalOpen: !s.isSearchModalOpen,
      isWalletModalOpen: false,
      isMenuModalOpen: false,
      isTwitterModalOpen: false,
      isApproveModalOpen: false,
      isLoginModalOpen: false,
    })),
  isWalletModalOpen: false,
  setIsWalletModalOpen: (s) => set({ isWalletModalOpen: s }),
  toggleIsWalletModalOpen: () =>
    set((s) => ({
      isWalletModalOpen: !s.isWalletModalOpen,
      isSearchModalOpen: false,
      isMenuModalOpen: false,
      isLoginModalOpen: false,
      isTwitterModalOpen: false,
      isApproveModalOpen: false,
    })),
  isMenuModalOpen: false,
  setIsMenuModalOpen: (s) => set({ isMenuModalOpen: s }),
  toggleIsMenuModalOpen: () =>
    set((s) => ({
      isMenuModalOpen: !s.isMenuModalOpen,
      isSearchModalOpen: false,
      isWalletModalOpen: false,
      isTwitterModalOpen: false,
      isLoginModalOpen: false,
      isApproveModalOpen: false,
    })),
  isTwitterModalOpen: false,
  setIsTwitterModalOpen: (s) => set({ isTwitterModalOpen: s }),
  toggleIsTwitterModalOpen: () =>
    set((s) => ({
      isTwitterModalOpen: !s.isTwitterModalOpen,
      isSearchModalOpen: false,
      isWalletModalOpen: false,
      isMenuModalOpen: false,
      isLoginModalOpen: false,
      isApproveModalOpen: false,
    })),
  isLoginModalOpen: false,
  setIsLoginModalOpen: (s) => set({ isLoginModalOpen: s }),
  toggleIsLoginModalOpen: () =>
    set((s) => ({
      isLoginModalOpen: !s.isLoginModalOpen,
      isTwitterModalOpen: false,
      isSearchModalOpen: false,
      isWalletModalOpen: false,
      isMenuModalOpen: false,
      isApproveModalOpen: false,
    })),
  isApproveModalOpen: false,
  setIsApproveModalOpen: (s) => set({ isApproveModalOpen: s }),
  toggleIsApproveModalOpen: () =>
    set((s) => ({
      isApproveModalOpen: !s.isLoginModalOpen,
      isTwitterModalOpen: false,
      isSearchModalOpen: false,
      isWalletModalOpen: false,
      isMenuModalOpen: false,
      isLoginModalOpen: false,
    })),
}));
