document.addEventListener("DOMContentLoaded", function () {
  // Load data from a .txt file
  d3.text("./data/venn_out_data.txt").then(function (data) {
    // Parse the data
    const parsedData = d3.dsvFormat("\t").parse(data);

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

    // Create the Venn diagram layout
    const vennDiagram = venn.VennDiagram().width(600).height(400);

    const chart = d3.select("#venDiagram").datum(sets).call(vennDiagram);

    // Add text for set labels and sizes below each set
    chart
      .selectAll(".venn-circle text")
      .attr("dy", function (d) {
        if (d.sets.length === 1) {
          return "1em";
        } else {
          return "-0.5em";
        }
      })
      .text(function (d) {
        return `${d.sets.join(" & ")} (${d.size})`;
      })
      .attr("class", function (d) {
        if (d.sets.includes("A")) {
          return "venn-label venn-label-A";
        } else if (d.sets.includes("B")) {
          return "venn-label venn-label-B";
        } else {
          return "venn-label";
        }
      });

    // Add text for common area size within the common area
    chart
      .select(".venn-area.AB")
      .select("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em") // Adjust vertical position if necessary
      .text(`Common A B (${sets[2].size})`)
      .attr("class", "venn-label venn-label-AB");

    // Select the tooltip element
    const tooltip = d3.select("#tooltip-venn");

    chart
      .selectAll("path")
      .attr("class", "venn-circle")
      .on("mouseover", function (event, d) {
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection.style("fill-opacity", 0.8);
        tooltip.transition().duration(400).style("display", "block");

        const sets = d.sets.join(" & ");
        const size = d.size;

        tooltip.html(`
          Sets: ${sets}<br>
          Size: ${size}
        `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection.style("fill-opacity", 0.5);
        tooltip.transition().duration(400).style("display", "none");
      })
      .on("click", function (event, d) {
        if (d.link) {
          window.open(d.link, "_blank");
        }
      });
  });
});
