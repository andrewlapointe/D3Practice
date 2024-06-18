import "./App.css";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";

function App() {
  return (
    <div className="App">
      <h1>Volcano Plot</h1>
      <VolcanoPlot
        pval={-Math.log(10) / Math.log(0.05)}
        foldChange={Math.log(2) / Math.log(2)}
        xCol={8}
        yCol={5}
        details={["p.value", "Fold.Change"]}
        xlabel="Log2(FC)"
        ylabel="-Log10(p)"
      />
    </div>
  );
}

export default App;
