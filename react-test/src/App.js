import "./App.css";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";
import data from "./data/all_data.tsv"; // static data import
import data2 from "./data/volcano.csv";

function App() {
  return (
    <div className="App">
      <h1>Volcano Plot</h1>
      <VolcanoPlot
        data={data}
        pval={0.05}
        foldChange={2}
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
