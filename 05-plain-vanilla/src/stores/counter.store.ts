import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface Store {
  counter: {
    id: string;
    alias: string;
    count: number;
  };
  increment: () => void;
  setAlias: (alias: string) => void;
}

export const useCounter = create<Store>()(
  devtools(
    immer((set) => ({
      counter: {
        id: "125-3434-3432",
        alias: "Office",
        count: 0,
      },
      increment: () =>
        set(
          (state) => {
            state.counter.count += 1;
          },
          false,
          "counter/increment"
        ),

      setAlias: (alias) =>
        set(
          (state) => {
            state.counter.alias = alias;
          },
          false,
          "counter/setAlias"
        ),
    })),
    { name: "counter-store" }
  )
);
