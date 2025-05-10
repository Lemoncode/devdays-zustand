# 05 Plain Vanilla

Una de las limitaciones que tenemos con React es que el contexto sólo se puede usar dentro de un componente o un hook.

Vamos a ver que nos ofrece Zustand para poder acceder a nuestro store fuera de un componente.

Ojo el ejemplo concreto que vamos a ver en la vida real no tendría sentido, pero es para ilustrar el concepto.

Vamos a crearnos un fichero que llamaremos _counter.utils.ts_ y dentro de él vamos a exponer una función que nos permita incrementar el contador y otra que nos de el valor.

_./src/components/counter.utils.ts_

```ts
import { useCounter } from "../stores/counter.store";

export const increment = () => {
  useCounter.getState().increment();
};
```

Vamos ahora a usarlo en nuetros componente:

_./src/counter-increment.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";
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

¿Por qué esto no va? Porque cuando leemos un valor desde fuera de un componente se lee el que tiene en ese momento y no se vuelve a ejecutar, es decir no se suscrbe a los cmabios y nos da una foto estática, no hay rerender porque no hay subscripción.

Y ahora estarás pensando ¿Y para que narices quiero esto? me puede valer para:

- Funciones de utilidad.
- Eventos globales (window, setInterval).
- Lógica de redireccionamento.

De hecho vamos a jugar un poco con esto:

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
useCounter.subscribe((state) => {
  console.log('Counter changed to', state.counter.count)
});
```

Y para terminar, vamos a despertar a la bicha... Zustand soporta middlewares, y como muestra... vamos a meter Zustand en las redux devtools :).



https://stackoverflow.com/questions/76929920/how-to-access-zustand-store-outside-a-functional-component
