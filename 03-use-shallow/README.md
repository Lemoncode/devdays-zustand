# 03 UseShallow

Vamos a empezar a hilar fino y ver como usar selectores para tener un mejor rendimiento.

## El ejemplo

Seguimos con el ejemplo del contador. Imagina que estamos trabajando con un contador de consumo eléctrico o cualquier otro dispositivo IoT. Cada dispositivo tiene un número de serie (lo llamaremos `id`), y también añadimos un campos adicional que llamaremos `alias`.

A nivel de store, la estructura quedaría así:

_./src/stores/counter.store.ts_

```diff
import {create} from "zustand";

type Store = {
+  id: string;
+  alias: string;
  count: number;
  inc: () => void;
+  setAlias: (alias: string) => void;
};

export const useCounter = create<Store>((set) => ({
+  id: "125-3434-3432",
+  alias: "Office",
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
+  setAlias: (alias: string) => set({ alias }),
}));
```

## Creando un componente para editar el alias

Ahora crearemos un componente que permita al usuario cambiar el alias del contador.

¿Qué vamos a necesitar del store? El alias y el método para cambiarlo.

_./src/components/counter-edit-alias.component.tsx_

```tsx
import { useCounter } from "../stores/counter.store";

export const CounterEditAliasComponent = () => {
  // EY no está optimizado, ¿Te ánimas luego a optimizarlo?
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
```

Lo añadimos al barrel:

_./src/components/index.ts_

```diff
export { CounterDisplay } from "./counter-display.component";
export { CounterIncrement } from "./counter-increment.component";
+ export * from "./counter-edit-alias.component";
```

## Mostrando información del alias

Ahora, añadiremos el número de serie (id) al componente que muestra el contador.

_./src/components/counter-display.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
-  const { count } = useCounter();
+ const { count, id } = useCounter();

-  return <h2>Current value: {count}</h2>;
+ return <h2>{id} Current value: {count}</h2>
}
```

## Instanciando el nuevo componente en App

Y en App vamos a instanciar el componente de edición

_./src/App.tsx_

```diff
import "./App.css";
- import { CounterDisplay, CounterIncrement } from "./components";
+ import { CounterDisplay, CounterIncrement, CounterEditAliasComponent } from "./components";

function App() {
  return (
    <>
      <div></div>
      <h1>Hola Zustand</h1>
+      <CounterEditAliasComponent />
      <CounterDisplay />
      <CounterIncrement />
    </>
  );
}

export default App;
```

## Analizando renders innecesarios

Si ejecutamos el código:

```bash
npm run dev
```

Podemos ver que el código funciona, peeerooo ¿Qué tal se porta esto de rendimiento?

Vamos a añadir un `console.log` en el componente que muestra el contador:

_./src/components/counter-display.component.tsx_

```diff
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
  const { count, id } = useCounter();

+ console.log(">> Rendering CounterDisplay");
  return <h2>{id} Current value: {count}</h2>
}
```

Si ahora ejecutamos y **CAMBIAMOS EL ALIAS**, vemos que `CounterDisplay` se renderiza innecesariamente.

¿Cómo podemos optimizar esto? Veamos que opciones tenemos disponibles:

**Opción 1.** podemos utilizar un `useCounter` por cada elemento:

_./src/components/counter-display.component.tsx_

```diff
import { useShallow } from "zustand/shallow";
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
-  const { count, id } = useCounter();

+  const id = useCounter((state) => state.id);
+  const count = useCounter((state) => state.count);

  console.log(">> CounterDisplay render");

  return (
    <h2>
      {id} Current value: {count}
    </h2>
  );
}
```

Si ejecutamos vemos que esto funciona ¿Es la mejor opción? Veamos pros y cons

**Pros**

- Al devolver un sólo elemento en el selector, `Zustand` utiliza la comparacíon de tripe igual `===` para saber si ha cambiado o no, y esto es muy eficiente.

**Cons**

- Si necesitamos muchas propiedades de ese store, hacer múltiples useCounter puede ser tedioso.

**Opción 2.** Selector mutiple

¿Y si nos traemos un objeto con todas las propiedades que necesitamos?

Algo así cómo:

_./src/components/counter-display.component.tsx_

```diff
import { useShallow } from "zustand/shallow";
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
-  const id = useCounter((state) => state.id);
-  const count = useCounter((state) => state.count);
+   const { id, count } = useCounter((state) => ({
+      id: state.id,
+      count: state.count
+   }));

  console.log(">> CounterDisplay render");

  return (
    <h2>
      {id} Current value: {count}
    </h2>
  );
}
```

Si ejecutamos esto... ¡ SORPRESA ! Nos da un castañazo bíblico, si abres la consola, pensarás ¿Qué está pasando aquí? Pues que en el selector estamos devolviendo un objeto nuevo cada vez que se ejecuta, y por tanto la comparación `===` lo considera un objeto nuevo y nos quedamos en bucle...

Zustand ofrece useShallow, que compara las propiedades de un objeto de manera superficial (shallow), evitando renders si los valores no cambian.

_¿Que podemos hacer aquí?_ Zustand trae un hook que se llama `useShallow` que nos permite hacer una comparación shallow de los objetos, es decir, si las propiedades de un objeto son las mismas, no renderiza,esto lo compara por referencia, no por valor (es decir tirando de punteros), y nos obliga a trabajar con estructuras inmutables.

Veamos como queda esto:

```diff
import { useShallow } from "zustand/shallow";
import { useCounter } from "../stores/counter.store";

export function CounterDisplay() {
-   const { id, count } = useCounter((state) => ({
+   useCounter(
+   useShallow((state) => ({
+      id: state.id,
+      count: state.count
-   }));
+   })));

  console.log(">> CounterDisplay render");

  return (
    <h2>
      {id} Current value: {count}
    </h2>
  );
}
```

Si ejecutamos esto, vemos que funciona, y que sólo se renderiza cuando cambia el valor de `id` o `count`.

¿Es esta la solución definitiva? Depende

Pros

- Si necesitamos traernos muchas propiedades del store, es una buena opción.

Cons

- La comparación Shallow, no es tan optima como ===

- Ojo, que tienes que trabajar con objetos inmutables, un fallo típico es tener un campo array y olvidarte que para modificar un elemento o añadir uno nuevo, tienes que hacerlo de forma inmutable (creas un nuevo array).

Si te fijas, aquí el autor de la librería de Zustand, nos deja a nosotros que eligamos entre las diferentes opciones, dependiendo de lo que necesitemos.

## ShallowCompare

Antes de dar esto por cerrado, puede que hayas oído eso de _Shallow Compare_ y te hayas quedado pensando... _vale, aceptamos barco_ :), vamos a pararnos y ver qué significa esto con unos ejemplos:

Hemos dicho que shallow compara solo los valores del primer nivel de un objeto. Esto significa que:

- Si el campo es un **valor primitivo** (string, number, boolean), lo compara **por valor**.

- Si el campo es un **objeto o array**, lo compara **por referencia** (es decir, verifica si apuntan a la misma posición en memoria).

Podemos implementar una función casera de shallowEqual tal que así:

```ts
const shallowEqual = (a, b) =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.keys(a).every((key) => a[key] === b[key]);
```

Probemos con algunos ejemplos

```ts
const obj1 = { name: "Alice", details: 25 };
const obj2 = { name: "Paco", details: 25 };

console.log("Comparacion 1: ", shallowEqual(obj1, obj2)); // false
```

Aquí false es evidente, porque name es diferente.

```ts
const obj3 = { name: "Alice", details: 25 };
const obj4 = { name: "Alice", details: 25 };

console.log("Comparacíon 2", shallowEqual(obj3, obj4)); // true
```

Aquí obtenemos true, porque todas las propiedades son valores primitivos y son iguales.

```ts
const obj5 = { name: "Alice", details: { age: 25 } };
const obj6 = { name: "Alice", details: { age: 25 } };

console.log("Comparacíon 3", shallowEqual(obj5, obj6)); // false
```

¡Sorpresa! 😲 Esto devuelve false, aunque details tenga los mismos valores. ¿Por qué?
Porque details es un objeto, y en una comparación shallow, los objetos se comparan por referencia.

Cada details es un objeto nuevo en memoria, por lo que se consideran diferentes.

Sin embargo, si hacemos esto:

```ts
const details = { age: 25 };
const obj7 = { name: "Alice", details };
const obj8 = { name: "Alice", details };

console.log("Comparacíon 4", shallowEqual(obj7, obj8)); // true
```

Tenemos que si da true, porque details es el mismo objeto en memoria.

🚀 ¿Cuál es la ventaja de usar shallowEqual?

Si trabajas con inmutabilidad, es una forma muy rápida de comparar objetos, no tiene que hacer una comparación profunda de todos los campos.
