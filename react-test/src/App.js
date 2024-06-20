import "./App.css";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";
import ScatterPlot from "./components/statisticalParametricTest/StatisticalParametricTest";
import Navbar from "./components/navBar/Navbar.js";
import data from "./data/all_data.tsv"; // static data import
import VennDiagramComponent from "./components/vennDiagram/VennDiagram.js";

function App() {
  return (
    <div className="App">
      <header>
        <Navbar />
      </header>
      <main>
        <section id="volcanoSection">
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
        </section>
        <section>
          <h1>Statistical Parametric Test</h1>
          <ScatterPlot />
        </section>
        <section id="venn-section">
          <h2>Venn Diagram</h2>
          <VennDiagramComponent />
        </section>
      </main>
    </div>
  );
}

export default App;
