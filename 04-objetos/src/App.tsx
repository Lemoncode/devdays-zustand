import "./App.css";
import {
  CounterDisplay,
  CounterIncrement,
  CounterEditAliasComponent,
} from "./components";

function App() {
  return (
    <>
      <h1>Hola Zustand</h1>
      <CounterEditAliasComponent />
      <CounterDisplay />
      <CounterIncrement />
    </>
  );
}

export default App;
