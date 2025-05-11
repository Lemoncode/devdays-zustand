# 02 Hola Selectores

El ejemplo anterior es muy sencillo, pero te he vendido la moto... vamos a ver que pasa con el rendimiento....

Pongamos un console.log en el componente Display y en el counter increment:

_./src/components/counter-display.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { count } = useCounter();

+ console.log("** CounterDisplay render");

  return <h2>Current value: {count}</h2>;
}
```

Y otro en el increment

_./src/components/counter-increment.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";

export function CounterIncrement() {
  const { inc } = useCounter();

+ console.log("## CounterIncrement render");
  return <button onClick={inc}>Increment</button>;
}
```

Vamos a ejecutar y vemos que pasa, abrimos la console de depuración del navegador y....:

SI NOS PONEMOS A PINCHAR EN EL BOTON DE INCREMENTE VEMOS QUE SE RENDERIZA EL COMPONENTE DE DISPLAY Y EL DEL BOTON :-@

¡¡¡ El del botón no debería de repintarse !!!

Vamos primero a entender el problema y luego vamos a por la solución.

Tal y como estamos _useCounter_ en _CounterIncrement_: nos trae todo el estado del store, y después le hacemos el destructuing para quedarnos solo con la función _inc_.

Esto es lo mismo que hacer lo siguiente:

_./src/components/counter-increment.component.tsx_

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

Vamos a seguir rascando :).
