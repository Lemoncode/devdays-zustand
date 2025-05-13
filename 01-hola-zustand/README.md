# Hola Zustand

Vamos a crear un proyecto sencillo que nos sirva de vehículo para aprender como funciona Zustand.

## Pasos

Lo primero, instalar la libreria (que por cierto pesa 588 bytes gzipeada)

```bash
npm install zustand
```

Arrancamos la aplicación

```bash
npm run dev
```

Y vamos a crear una carpeta stores donde vamos a poner nuestros almacenes de datos.

_./src/stores/counter.store.ts_

```ts
import { create } from "zustand";

type Store = {
  count: number;
  increment: () => void;
};

// Si usas createStore puedes crear el store de zustand
// en plain vanilla JS
// https://zustand.docs.pmnd.rs/apis/create-store
export const useCounter = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

> Lo de crear una carpeta global para los stores está bien para ciertas cosas (si realmente son datos transversales), para otras merece la pena tenerlo más cerca del área que lo use.

Ahora vamos a crear un carpeta que llamaremos _components_ y dentro de ella vamos a crear dos componentes separados:

- Uno para visualizar el valor del contador.
- Otro para incrementar el contador.

_./src/components/counter-display.component.tsx_

```tsx
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { count } = useCounter();
  return <h2>Current value: {count}</h2>;
}
```

Vamos a por el otro:

_./src/components/counter-increment.component.tsx_

```tsx
import { useCounter } from "../stores/counter.store";

export function CounterIncrement() {
  const { increment } = useCounter();
  return <button onClick={increment}>Increment</button>;
}
```

Vamos a crear un barrel para exportar todos los componentes de una vez:

_./src/components/index.ts_

```ts
export * from "./counter-display.component";
export * from "./counter-increment.component";
```

Y vamos a usarlos en nuestro App

_./src/App.tsx_

```diff
import "./App.css";
+ import { CounterDisplay, CounterIncrement } from "./components";

function App() {
  return (
    <>
      <h1>Hola Zustand</h1>
+    <CounterDisplay />
+    <CounterIncrement />
    </>
  );
}

export default App;
```

Ejecutamos y lo tenemos funcionando :).

```bash
npm run dev
```

Hasta aquí la "vendida de moto", vamos a bajar esto a la tierra y ver más casos.
