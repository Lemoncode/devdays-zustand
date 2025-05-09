import { useShallow } from "zustand/shallow";
import { useCounter } from "../stores/counter.store";

export const CounterEditAliasComponent = () => {
  // EY no está optimziado, ¿Te ánimas luego a optimizarlo?
  const { alias, setAlias } = useCounter(
    useShallow((state) => ({
      alias: state.counter.alias,
      setAlias: state.setAlias,
    }))
  );

  return (
    <div>
      <input
        type="text"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />
    </div>
  );
};
