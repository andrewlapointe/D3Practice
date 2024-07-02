import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import venn from "venn.js";

const VennDiagramComponent = ({ uniqueA, uniqueB, commonAB }) => {
  const vennRef = useRef(null);

  useEffect(() => {
    const sets = [
      { sets: ["A"], size: uniqueA },
      { sets: ["B"], size: uniqueB },
      { sets: ["A", "B"], size: commonAB },
    ];

    // Create the Venn diagram
    const vennDiagram = venn.VennDiagram().width(600).height(400);
    const chart = d3.select(vennRef.current).datum(sets).call(vennDiagram);

    // Select the tooltip element
    const tooltip = d3.select("#tooltip-venn");

    chart
      .selectAll("path")
      .attr("class", "venn-circle")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition("tooltip")
          .duration(400)
          .style("fill-opacity", 0.8);
        tooltip.transition().duration(400).style("display", "block");

        tooltip.html(`
          Sets: ${d.sets.join(" & ")}<br>
          Size: ${d.size}
        `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition("tooltip")
          .duration(400)
          .style("fill-opacity", 0.5);
        tooltip.transition().duration(400).style("display", "none");
      });

    chart.selectAll("text").attr("class", function (d) {
      if (d.sets.includes("A")) {
        return "venn-label venn-label-A";
      } else if (d.sets.includes("B")) {
        return "venn-label venn-label-B";
      } else {
        return "venn-label";
      }
    });
  }, [uniqueA, uniqueB, commonAB]);

  return (
    <div>
      <h2>Venn Diagram</h2>
      <div id="venDiagram" ref={vennRef}></div>
      <div
        id="tooltip-venn"
        style={{
          position: "absolute",
          display: "none",
          background: "#fff",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      ></div>
    </div>
  );
};

export default VennDiagramComponent;
