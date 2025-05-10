import { useShallow } from "zustand/shallow";
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { id, count } = useCounter(
    useShallow((state) => ({
      count: state.counter.count,
      id: state.counter.id,
    }))
  );

  console.log(">> Rendering CounterDisplay");

  return (
    <h2>
      {id} Current value: {count}
    </h2>
  );
}
