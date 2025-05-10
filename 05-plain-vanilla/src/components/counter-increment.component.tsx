import { increment } from "./counter.utils";

export function CounterIncrement() {
  return <button onClick={increment}>Increment</button>;
}
