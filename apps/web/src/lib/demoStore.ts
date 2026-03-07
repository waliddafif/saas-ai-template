import { create } from "zustand";

interface DemoStore {
  isDemo: boolean;
  setDemo: (value: boolean) => void;
}

export const useDemoStore = create<DemoStore>((set) => ({
  isDemo: false,
  setDemo: (isDemo) => set({ isDemo }),
}));
