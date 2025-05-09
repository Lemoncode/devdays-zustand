import { useCounter } from "../stores/counter.store";

export function CounterIncrement() {
  const increment = useCounter((state) => state.increment);

  return <button onClick={increment}>Increment</button>;
}
