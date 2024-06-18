import "./App.css";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";

function App() {
  return (
    <div className="App">
      <h1>Volcano Plot</h1>
      <VolcanoPlot pval={1} xCol={8} yCol={5} />
    </div>
  );
}

export default App;
