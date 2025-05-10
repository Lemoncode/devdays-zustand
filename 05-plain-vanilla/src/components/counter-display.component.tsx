import { getCount, getId } from "./counter.utils";

export function CounterDisplay() {
  console.log(">> Rendering CounterDisplay");

  return (
    <h2>
      {getId()} Current value: {getCount()}
    </h2>
  );
}
