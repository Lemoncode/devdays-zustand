# 04 Actualizando objetos

Hasta ahora hemos estado trabajando con un estado que es un objeto simple:

```ts
export const useCounter = create<Store>((set) => ({
  id: "125-3434-3432",
  alias: "Office",
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  setAlias: (alias: string) => set({ alias }),
}));
```

Y para los setters, resulta que Zustand aplica el spread operator en el primer nivel por nosotros, es decir, la siguiente línea:

```ts
setAlias: (alias: string) => set({ alias }),
```

Internamente es equivalente a:

```ts
setAlias: (alias: string) => set((state) => { ...state, alias }),
```

✅ Esto es útil cuando trabajamos con propiedades directas del estado.

Pero... ¿qué pasa cuando trabajamos con objetos anidados?

## Encapsulando el estado en un objeto

Vamos a encapsular la información del contador en un objeto:

_./src/stores/counter.store.ts_

```diff
import { create } from "zustand";

+ interface Counter {
+   id: string;
+   alias: string;
+   count: number;
+ }


type Store = {
-  id: string;
-  alias: string;
-  count: number;
+  counter: Counter;
  inc: () => void;
  setAlias: (alias: string) => void;
};

export const useCounter = create<Store>((set) => ({
+  counter: {
+    id: "125-3434-3432",
+    alias: "Office",
+    count: 0,
+  },
  inc: () => set((state) => ({ count: state.count + 1 })),
  setAlias: (alias: string) => set({ alias }),
}));
```

🚨 Problema: Ahora los setters fallan porque el estado ya no tiene count y alias directamente, sino que están dentro del objeto counter.

## Actualizando objetos anidados en Zustand

En este caso, como tenemos dos niveles de anidamiento, necesitamos hacer un spread manualmente para preservar el estado anterior.

```diff
-  increment: () => set((state) => ({ count: state.count + 1 })),
+ increment: () => set((state) => ({ counter: { ...state.counter, count: state.counter.count + 1 } })),
-  setAlias: (alias: string) => set({ alias }),
+  setAlias: (alias: string) => set((state) => ({ counter: { ...state.counter, alias } })),
```

🔹 Explicación:

- El primer spread { ...state.counter } mantiene el resto de las propiedades del objeto counter.

- Luego sobrescribimos únicamente la propiedad que queremos modificar (count o alias).

Vamos a arreglar el resto del código, para reflejar estos cambios.

## Actualizando los componentes

En counter display:

_./src/components/counter-display.component.tsx_

```diff
export function CounterDisplay() {
  const { count, id } = useCounter(
    useShallow((state) => ({
-      count: state.count,
-      id: state.id,
+      count: state.counter.count,
+      id: state.counter.id,
    }))
  );

  console.log(">> CounterDisplay render");

  return (
    <h2>
      {id} Current value: {count}
    </h2>
  );
}
```

👀 Nota:

Estamos accediendo a state.counter.alias en lugar de state.alias.

También podríamos haber tomado directamente counter y acceder a sus propiedades desde el componente.

> OJO Opcion dos, destructuring y usar counter

_./src/components/counter-edit-alias.component.tsx_

```diff
export const CounterEditAliasComponent = () => {
  const { alias, setAlias } = useCounter(
    useShallow((state) => ({
-      alias: state.alias,
+      alias: state.counter.alias,
      setAlias: state.setAlias,
    }))
  );
```

## El problema del spread en objetos anidados

Si has trabajado con React antes, seguro sabes que usar el spread operator en objetos con varios niveles de anidamiento se vuelve complicado rápidamente.

¿Qué podemos hacer para simplificar esto?

👉 Usar immer para mutaciones inmutables de manera más sencilla.

## Refactorizando con immer 🚀

📌 immer es una librería ligera que nos permite actualizar objetos de manera inmutable sin necesidad de usar el spread operator en cada nivel.

Que es lo bueno, que Zustand trae un middleware que hace muy fácil integrar immer.

Lo primero instalar la librería _immer_:

```bash
npm install immer
```

En el store nos vamos a importar el middleware de immer:

_./src/stores/counter.store.ts_

```diff
import { create } from "zustand";
+ import { immer } from 'zustand/middleware/immer';
```

Y vamos a refactorizar el store para usarla, en esta caso:
_./src/stores/counter.store.ts_

```diff
- export const useCounter = create<Store>(
+ export const useCounter = create<Store>(
+  immer(
  (set) => ({
  counter: {
    id: "125-3434-3432",
    alias: "Office",
    count: 0,
  },
  increment: () =>
    set((state) => ({
      counter: { ...state.counter, count: state.counter.count + 1 },
    })),
  setAlias: (alias: string) =>
    set((state) => ({ counter: { ...state.counter, alias } })),
})
+ )
);
```

Aquí tenemos dos problemas:

- Uno un error de tipado (al meter el middleware immer no sacar el tipo _Store_).
- Otro, que cuesta leer este código con tanto parentesis.

Vamos a arreglaro esto:

Por un lado añadimos crear el tipado del store usando la función de Zustand _createStore_:

_./src/stores/counter.store.ts_

```diff
type Store = {
  counter: Counter;
  increment: () => void;
  setAlias: (alias: string) => void;
};

+ // StateCreator<
+ // T,            // el tipo de estado completo (tu store)
+ // M,           // la lista de middlewares aplicados
+ //  CustomSet,   // funciones personalizadas para set()
+ // >
+ type StoreCreator = StateCreator<Store, [["zustand/immer", never]], []>;
```

Y ahora vamos a sacar el objeto fucero del _create_

```diff
type StoreCreator = StateCreator<Store, [["zustand/immer", never]], []>;

+ const store: StoreCreator = (set) => ({
+  counter: {
+    id: "125-3434-3432",
+    alias: "Office",
+    count: 0,
+  },
+  increment: () =>
+    set((state) => ({
+      counter: { ...state.counter, count: state.counter.count + 1 },
+    })),
+  setAlias: (alias: string) =>
+    set((state) => ({ counter: { ...state.counter, alias } })),
+ });
```

Y ahora que lo la función create queda más simple:

> ¡¡ OJO LA FUNCION PASA A ESTAR CURRIFICADA !!

```diff
- export const useCounter = create<Store>(
+ export const useCounter = create<Store>()(
  immer(
-  (set) => ({
-  counter: {
-    id: "125-3434-3432",
-    alias: "Office",
-    count: 0,
-  },
-  increment: () =>
-    set((state) => ({
-      counter: { ...state.counter, count: state.counter.count + 1 },
-    })),
-  setAlias: (alias: string) =>
-    set((state) => ({ counter: { ...state.counter, alias } })),
-})
+ store
 )
);
```

El código final tiene que quedar tal que así:

**NO COPIAR Y PEGAR**

```ts
import { create, type StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

interface Counter {
  id: string;
  alias: string;
  count: number;
}

type Store = {
  counter: Counter;
  increment: () => void;
  setAlias: (alias: string) => void;
};

// StateCreator<
// T,            // el tipo de estado completo (tu store)
// M,           // la lista de middlewares aplicados
//  CustomSet,   // funciones personalizadas para set()
// >
type StoreCreator = StateCreator<Store, [["zustand/immer", never]], []>;

const store: StoreCreator = (set) => ({
  counter: {
    id: "125-3434-3432",
    alias: "Office",
    count: 0,
  },
  increment: () =>
    set((state) => ({
      counter: { ...state.counter, count: state.counter.count + 1 },
    })),
  setAlias: (alias: string) =>
    set((state) => ({ counter: { ...state.counter, alias } })),
});

export const useCounter = create<Store>()(immer(store));
```

Y ahora que tenemos immer por fin podemos dejar de usar el spread operator y directamente hacer actualizaciones mutables que immer se encarga de convertir en inmutables.

```diff
const store: StoreCreator = (set) => ({
  counter: {
    id: "125-3434-3432",
    alias: "Office",
    count: 0,
  },
  increment: () =>
    set((state) =>
-    ({
-      counter: { ...state.counter, count: state.counter.count + 1 },
-    })
+   {
+    state.counter.count += 1;
+   }
    ),
  setAlias: (alias: string) =>
    set((state) =>
-      (
-      { counter: { ...state.counter, alias } }
-      )
+      {
+      state.counter.alias = alias;
+      }
    ),
});
```

🔹 Zustand maneja la inmutabilidad en el primer nivel, pero si trabajamos con objetos anidados, necesitamos hacer spreads manuales o usar una herramienta como immer.

🔹 Con immer:

✅ Podemos escribir código más limpio y conciso.

✅ Se mantiene el concepto de estado inmutable sin dolores de cabeza.

✅ Es una solución versátil, no solo para Zustand, sino para cualquier parte de nuestro código.
