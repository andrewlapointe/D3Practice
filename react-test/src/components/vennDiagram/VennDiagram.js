import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { VennDiagram } from "venn.js";
import "./venn.css";
import vennData from "../../data/venn_out_data.txt";

const VennDiagramComponent = () => {
  const vennRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    // Load data from a .txt file
    d3.text(vennData)
      .then((data) => {
        console.log("Raw data:", data); // Check if the data is loaded

        // Parse the data
        const parsedData = d3.dsvFormat("\t").parse(data);
        console.log("Parsed data:", parsedData); // Check the parsed data

        // Filter the data based on columns
        const commonAB = parsedData
          .filter((d) => d["Common A B"] !== "NA")
          .map((d) => d["Common A B"]);
        const uniqueA = parsedData
          .filter((d) => d["Unique A"] !== "NA")
          .map((d) => d["Unique A"]);
        const uniqueB = parsedData
          .filter((d) => d["Unique B"] !== "NA")
          .map((d) => d["Unique B"]);

        console.log("Unique A:", uniqueA);
        console.log("Unique B:", uniqueB);
        console.log("Common A B:", commonAB);

        // Generate Google search links for the most common proteins
        const salivaryProteomeBaseUrl = "https://salivaryproteome.org/protein/";

        // Prepare the sets for the Venn diagram
        const sets = [
          {
            sets: ["A"],
            size: uniqueA.length,
            link:
              uniqueA.length > 0
                ? `${salivaryProteomeBaseUrl}${encodeURIComponent(uniqueA[0])}`
                : "",
            data: uniqueA,
          },
          {
            sets: ["B"],
            size: uniqueB.length,
            link:
              uniqueB.length > 0
                ? `${salivaryProteomeBaseUrl}${encodeURIComponent(uniqueB[0])}`
                : "",
            data: uniqueB,
          },
          {
            sets: ["A", "B"],
            size: commonAB.length,
            link:
              commonAB.length > 0
                ? `${salivaryProteomeBaseUrl}${encodeURIComponent(commonAB[0])}`
                : "",
            data: commonAB,
          },
        ];

        console.log("Sets for Venn diagram:", sets);

        // Create the Venn diagram layout
        const vennDiagram = VennDiagram().width(600).height(400);
        const chart = d3.select(vennRef.current).datum(sets).call(vennDiagram);

        // Add text for set labels and sizes below each set
        chart
          .selectAll(".venn-circle text")
          .attr("dy", (d) => (d.sets.length === 1 ? "1em" : "-0.5em"))
          .text((d) => `${d.sets.join(" & ")} (${d.size})`)
          .attr("class", (d) => {
            if (d.sets.includes("A")) {
              return "venn-label venn-label-A";
            } else if (d.sets.includes("B")) {
              return "venn-label venn-label-B";
            } else {
              return "venn-label venn-label-AB";
            }
          });

        // Add text for common area size within the common area
        chart
          .select(".venn-area path[data-venn-sets='0_1']")
          .select("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em") // Adjust vertical position if necessary
          .text(`Common A B (${sets[2].size})`)
          .attr("class", "venn-label venn-label-AB");

        // Select the tooltip element
        const tooltip = d3.select(tooltipRef.current);

        chart
          .selectAll("path")
          .attr("class", "venn-circle")
          .on("mouseover", function (event, d) {
            const selection = d3
              .select(this)
              .transition("tooltip")
              .duration(400);
            selection.style("fill-opacity", 0.8);
            tooltip.transition().duration(400).style("display", "block");

            const sets = d.sets.join(" & ");
            const size = d.size;

            tooltip.html(`
              Sets: ${sets}<br>
              Size: ${size}
            `);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", event.pageX + 15 + "px")
              .style("top", event.pageY - 28 + "px");
          })
          .on("mouseout", function () {
            const selection = d3
              .select(this)
              .transition("tooltip")
              .duration(400);
            selection.style("fill-opacity", 0.5);
            tooltip.transition().duration(400).style("display", "none");
          })
          .on("click", (event, d) => {
            if (d.link) {
              window.open(d.link, "_blank");
            }
          });
      })
      .catch((error) => {
        console.error("Error loading the data:", error);
      });
  }, []);

  return (
    <div id="venn-container">
      <div id="venDiagram" ref={vennRef}></div>
      <div id="tooltip-venn" ref={tooltipRef}></div>
    </div>
  );
};

export default VennDiagramComponent;
