import "./App.css";
import VolcanoPlot from "./components/volcanoplot/Volcanoplot";
import ScatterPlot from "./components/statisticalParametricTest/StatisticalParametricTest";
import Navbar from "./components/navBar/Navbar";

function App() {
  return (
    <div className="App">
      <header>
        <Navbar />
      </header>
      <main>
        <section id="volcanoSection">
          <h1>Volcano Plot</h1>
          <VolcanoPlot pval={1} xCol={8} yCol={5} />
        </section>
        <section>
          <h1>Statistical Parametric Test</h1>
          <ScatterPlot />
        </section>
      </main>
    </div>
  );
}

export default App;
