import { create } from "zustand";
import { produce } from "immer";

interface Counter {
  id: string;
  alias: string;
  count: number;
}

type Store = {
  counter: Counter;
  increment: () => void;
  setAlias: (alias: string) => void;
};

export const useCounter = create<Store>((set) => ({
  counter: {
    id: "125-3434-3432",
    alias: "Office",
    count: 0,
  },
  increment: () =>
    set(
      produce((draft) => {
        draft.counter.count += 1;
      })
    ),
  setAlias: (alias: string) =>
    set(
      produce((draft) => {
        draft.counter.alias = alias;
      })
    ),
}));
