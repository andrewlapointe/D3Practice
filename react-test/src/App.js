import logo from "./logo.svg";
import "./App.css";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";

function App() {
  const dataUrl = "../../data/volcano.csv";

  return (
    <div className="App">
      <h1>Volcano Plot</h1>
      <VolcanoPlot dataUrl={dataUrl} />
    </div>
  );
}

export default App;
