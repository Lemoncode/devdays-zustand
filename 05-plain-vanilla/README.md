# 05 Plain Vanilla

Una de las limitaciones que tenemos con React es que el contexto sólo se puede usar dentro de un componente o un hook.

Vamos a ver que nos ofrece Zustand para poder acceder a nuestro store fuera de un componente.

Ojo el ejemplo concreto que vamos a ver en la vida real no tendría sentido, pero es para ilustrar el concepto.

Vamos a crearnos un fichero que llamaremos _counter.utils.ts_ y dentro de él vamos a exponer una función que nos permita incrementar el contador y otra que nos de el valor.

_./src/components/counter.utils.ts_

```ts
import { useCounter } from "../stores/counter.store";

export const increment = () => {
  // Ojo, fijate en getState :)
  useCounter.getState().increment();
};
```

Vamos ahora a usarlo en nuestro componente:

_./src/counter-increment.component.tsx_

```diff
-import { useCounter } from "../stores/counter.store";
+ import { increment } from "./counter.utils";

export function CounterIncrement() {
-  const increment = useCounter((state) => state.increment);

  return <button onClick={increment}>Increment</button>;
}
```

Ahora es el momento en que nos podemos venir arriba y pensar, hostis pues voy a hacer también un helper para leer los valores, algo así como:

_./src/components/counter.utils.ts_

```diff
import { useCounter } from "../stores/counter.store";

export const increment = () => {
  useCounter.getState().increment();
};

+ export const getCount = () => {
+  return useCounter.getState().counter.count;
+ };
+
+ export const getId = () => {
+  return useCounter.getState().counter.id;
+ };
```

Y usarlo en _counter-display.component.tsx_

_./src/counter-display.component.tsx_

```diff
- import { useShallow } from "zustand/shallow";
- import { useCounter } from "../stores/counter.store";
+ import { getCount, getId} from "./counter.utils";

export function CounterDisplay() {
-  const { id, count } = useCounter(
-    useShallow((state) => ({
-      count: state.counter.count,
-      id: state.counter.id,
-    }))
-  );

  console.log(">> Rendering CounterDisplay");

  return (
    <h2>
-      {id} Current value: {count}
+      {getId()} Current value: {getCount()}
    </h2>
  );
}
```

Si ejecutamos y le damos a increment... ÑOOOOC

¿Por qué esto no va? Porque cuando leemos un valor desde fuera de un componente se lee el que tiene en ese momento y no se vuelve a ejecutar, es decir no se suscrbe a los cambios y nos da una foto estática, no hay rerender porque no hay subscripción.

Y ahora estarás pensando ¿Y para que narices quiero esto? me puede valer para:

- Funciones de utilidad.
- Eventos globales (window, setInterval).
- Lógica de redireccionamento.

De hecho vamos a jugar un poco con esto (abre la consola de las devtools del navegador):

_./src/components/counter.utils.ts_

```diff
export const getCount = () => {
+  setInterval(() => {
+    console.log(">> Interval", useCounter.getState().counter.count);
+  }, 2000);

  return useCounter.getState().counter.count;
};
```

¿Y si movemos el _useCounter_ fuera del interval?

_./src/components/counter.utils.ts_

```diff
export const getCount = () => {
+  const { counter } = useCounter.getState();
+  setInterval(() => {
+    console.log(">> Interval", counter.count);
+  }, 2000);

  return counter.count;
};
```

Si te fijas sólo se evalua una vez, pero tenemos una cosa más interesante podemos suscribirnos a los cambios de la store y ejecutar una función cada vez que cambie el valor.

Vamos primero a eliminar el setInterval.

_./src/components/counter.utils.ts_

```diff
export const getCount = () => {
- const { counter } = useCounter.getState();
-  setInterval(() => {
-    console.log(">> Interval", counter.count);
-  }, 2000);

  return counter.count;
};
```

_./src/components/counter.utils.ts_

```diff
+ useCounter.subscribe((state) => {
+  console.log('Counter changed to', state.counter.count)
+ });
```

Y para terminar, vamos a despertar a la bicha... ya hemos visto que Zustand soporta middlewares, y... vamos a meter Zustand en las redux devtools :).

Lo primero dejamos el display como estaba antes para que se vean los cambios, lo reemplazamos por la versión anterior

_./src/counter-display.component.tsx_

```tsx
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
```

Vamos a nuestro store y usamos el middleware de devtools que trae Zustand.

Lo primero lo importamos:

_./src/stores/counter.store.ts_

```diff
import { create, type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
+ import { devtools } from "zustand/middleware";
```

Lo segundo, actualizamos los tipos para indicarle que vamos a tener este middleware:

```diff
// StateCreator<
// T,            // el tipo de estado completo (tu store)
// M,           // la lista de middlewares aplicados
//  CustomSet,   // funciones personalizadas para set()
// >
type StoreCreator = StateCreator<Store, [
  ["zustand/immer", never],
+ ["zustand/devtools", never]
], []>;
```

Y ahora actualizamos el _create<Store>_ para que use el middleware de devtools:

```diff
export const useCounter = create<Store>()(
+ devtools(
    immer(store),
+    {name: "counter-store"} // Le damos un nombre único al store
+ ),
);
```

Y a cada acción le vamos a dar un nombre para que se vea en las devtools:

```diff
const store: StoreCreator = (set) => ({
  counter: {
    id: "125-3434-3432",
    alias: "Office",
    count: 0,
  },
  increment: () =>
    set((state) => {
      state.counter.count += 1;
    },
+ false,
+ "counter/increment" // Nombre de la acción
    ),
  setAlias: (alias: string) =>
    set((state) => {
      state.counter.alias = alias;
    },
+    false,
+    "counter/alias" // Nombre de la acción
    ),
});
```

Vamos a probar..., F12 y mostramos las redux dev tools

