import React, { useState } from "react";
import VennData from "./components/VennData";
import VennDiagramComponent from "./components/VennDiagramComponent";

const App = () => {
  const [vennCounts, setVennCounts] = useState({
    uniqueA: 0,
    uniqueB: 0,
    commonAB: 0,
  });

  return (
    <div>
      <VennData onDataLoaded={setVennCounts} />
      <VennDiagramComponent
        uniqueA={vennCounts.uniqueA}
        uniqueB={vennCounts.uniqueB}
        commonAB={vennCounts.commonAB}
      />
    </div>
  );
};

export default App;
