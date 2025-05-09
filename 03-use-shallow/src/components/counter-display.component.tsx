import { useShallow } from "zustand/shallow";
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { id, count } = useCounter(
    useShallow((state) => ({
      id: state.id,
      count: state.count,
    }))
  );

  console.log(">> Rendering CounterDisplay");

  return (
    <h2>
      {id} Current value: {count}
    </h2>
  );
}
