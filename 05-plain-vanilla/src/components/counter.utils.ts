import { useCounter } from "../stores/counter.store";

export const increment = () => {
  useCounter.getState().increment();
};

export const getCount = () => {
  return useCounter.getState().counter.count;
};

export const getId = () => {
  return useCounter.getState().counter.id;
};

useCounter.subscribe((state) => {
  console.log("Counter changed to", state.counter.count);
});
