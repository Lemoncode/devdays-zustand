# 02 Hola Selectores

En el ejemplo anterior:

- Creamos un store que almacenaba un contador y exponía una función (acción) para incrementarlo.

- Creamos un componente que mostraba el valor del contador y otro que incrementaba el contador.

Hasta aquí todo genial, pero una de las ventajas que te prometí de Zustand respecto al contexto de React es que un cambio en un campo del estado no provoca una re-renderización de todos los componentes que usan ese estado.

Vamos a ver si esto es así, pongamos un console.log en el componente Display y en el counter increment:

_./src/components/counter-display.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { count } = useCounter();

+ console.log("** CounterDisplay render");

  return <h2>Current value: {count}</h2>;
}
```

_./src/components/counter-increment.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";

export function CounterIncrement() {
  const { inc } = useCounter();

+ console.log("## CounterIncrement render");
  return <button onClick={inc}>Increment</button>;
}
```

Vamos a ejecutar y vemos que pasa:

- Cuando arranca el proyecto se renderizan ambos componentes, todo bien.

- Pulso que incrementa el contador y se renderiza el componente Display (es razonable, ha cambiado el valor), pero... también el Increment ¡ Pero que narices pasa aquí! ¿No se supone que no se renderizan los componentes que no usan el campo que ha cambiado?

Vamos primero a entender el problema y luego vamos a por la solución.

Tal y como estamos _useCounter_ en _CounterIncrement_: nos trae todo el estado del store, y después le hacemos el destructuing para quedarnos solo con la función _inc_.

Esto es lo mismo que hacer lo siguiente:

```diff
export function CounterIncrement() {
-  const { inc } = useCounter();
+  const state = useCounter();

   console.log("## CounterIncrement render");

-  return <button onClick={inc}>Increment</button>;
+ return <button onClick={state.increment}>Increment</button>;
}
```

¿Qué está pasando? Pues que el estado cambia, y aunque el componente _CounterIncrement_ no use el campo _count_ del estado, se renderiza igualmente.

¿Qué podemos hacer? ¡ SELECTORES al rescate !

El hook que crea Zustand nos permite pasarle una función que recibe el estado y devuelve solo el campo que necesitamos.

```diff
export function CounterIncrement() {
-  const state = useCounter();
+  const increment = useCounter((state) => state.increment);

   console.log("## CounterIncrement render");

-  return <button onClick={inc}>Increment</button>;
+  return <button onClick={increment}>Increment</button>;
}
```

Si ahora ejecutamos, podrás ver que _CounterIncrement_ no se renderiza cuando incrementamos el contador.

Para verlo más claro podemos quitar el console.log del display:

```diff
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { count } = useCounter();

- console.log("** CounterDisplay render");

  return <h2>Current value: {count}</h2>;
}
```

Y ahora si ejecutamos, no sale nada por consola.

Hemos rascado sólo la superficie de los selectores, el objetivo de este vídeo es que entiendas el problema que tenemos al no usar selectores y cómo funcionan, en próximas entregas seguiremos profundizando en este tema.
