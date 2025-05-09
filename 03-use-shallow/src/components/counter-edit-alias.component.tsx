import { useCounter } from "../stores/counter.store";

export const CounterEditAliasComponent = () => {
  // EY no está optimziado, ¿Te ánimas luego a optimizarlo?
  const { alias, setAlias } = useCounter();

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
