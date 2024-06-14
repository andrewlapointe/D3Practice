import logo from "./logo.svg";
import "./App.css";
import data from "./data/volcano.csv";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";

function App() {
  return (
    <div className="App">
      <h1>Volcano Plot</h1>
      <VolcanoPlot />
    </div>
  );
}

export default App;
