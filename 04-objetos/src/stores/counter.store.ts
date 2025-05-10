import { create, type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

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

// StateCreator<
// T,            // el tipo de estado completo (tu store)
// M,           // la lista de middlewares aplicados
//  CustomSet,   // funciones personalizadas para set()
// >
type StoreCreator = StateCreator<Store, [["zustand/immer", never]], []>;

const store: StoreCreator = (set) => ({
  counter: {
    id: "125-3434-3432",
    alias: "Office",
    count: 0,
  },
  increment: () =>
    set((state) => {
      state.counter.count += 1;
    }),
  setAlias: (alias: string) =>
    set((state) => {
      state.counter.alias = alias;
    }),
});

export const useCounter = create<Store>()(immer(store));
