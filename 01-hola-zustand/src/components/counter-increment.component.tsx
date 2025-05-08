import { useCounter } from "../stores/counter.store";

export function CounterIncrement() {
  const { increment } = useCounter();
  return <button onClick={increment}>Increment</button>;
}
