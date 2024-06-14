document.addEventListener("DOMContentLoaded", function () {
  // Load data from a .txt file
  d3.text("./data/venn_out_data.txt").then(function (data) {
    // Parse the data
    const parsedData = d3.dsvFormat("\t").parse(data);

    // Helper function to get the most common protein and its count
    function getMostCommonProtein(data, column) {
      const proteinCounts = data.reduce((acc, d) => {
        if (d[column] !== "NA") {
          acc[d[column]] = (acc[d[column]] || 0) + 1;
        }
        return acc;
      }, {});
      const mostCommonProtein = Object.keys(proteinCounts).reduce(
        (a, b) => (proteinCounts[a] > proteinCounts[b] ? a : b),
        null
      );
      return {
        protein: mostCommonProtein,
        count: proteinCounts[mostCommonProtein] || 0,
      };
    }

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
    const searchBaseUrl = "https://www.google.com/search?q=";

    // Get most common proteins and their links
    const mostCommonA = getMostCommonProtein(parsedData, "Unique A");
    const mostCommonB = getMostCommonProtein(parsedData, "Unique B");
    const mostCommonAB = getMostCommonProtein(parsedData, "Common A B");

    // Construct URLs for salivaryproteome.org
    const salivaryProteomeBaseUrl = "https://salivaryproteome.org/protein/";

    const sets = [
      {
        sets: ["A"],
        size: uniqueA.length,
        link: mostCommonA.protein
          ? `${salivaryProteomeBaseUrl}${encodeURIComponent(
              mostCommonA.protein
            )}`
          : "",
        data: uniqueA,
      },
      {
        sets: ["B"],
        size: uniqueB.length,
        link: mostCommonB.protein
          ? `${salivaryProteomeBaseUrl}${encodeURIComponent(
              mostCommonB.protein
            )}`
          : "",
        data: uniqueB,
      },
      {
        sets: ["A", "B"],
        size: commonAB.length,
        link: mostCommonAB.protein
          ? `${salivaryProteomeBaseUrl}${encodeURIComponent(
              mostCommonAB.protein
            )}`
          : "",
        data: commonAB,
      },
    ];

    // Create the Venn diagram layout
    const vennDiagram = venn.VennDiagram().width(600).height(400);

    const chart = d3.select("#venDiagram").datum(sets).call(vennDiagram);

    // Select the tooltip element
    const tooltip = d3.select("#tooltip-venn");

    chart
      .selectAll("path")
      .attr("class", "venn-circle")
      .on("mouseover", function (event, d) {
        console.log("Mouseover event triggered"); // Debug log
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection.style("fill-opacity", 0.8);
        tooltip.transition().duration(400).style("display", "block");

        const sets = d.sets.join(" & ");
        const size = d.size;
        const mostCommon = getMostCommonProtein(
          parsedData,
          sets === "A" ? "Unique A" : sets === "B" ? "Unique B" : "Common A B"
        );

        tooltip.html(`
                      Sets: ${sets}<br>
                      Size: ${size}<br>
                      Most Common Protein: ${mostCommon.protein || "None"}<br>
                      Count: ${mostCommon.count}
                  `);
      })
      .on("mousemove", function (event) {
        console.log("Mousemove event triggered"); // Debug log
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        console.log("Mouseout event triggered"); // Debug log
        const selection = d3.select(this).transition("tooltip").duration(400);
        selection.style("fill-opacity", 0.5);
        tooltip.transition().duration(400).style("display", "none");
      })
      .on("click", function (event, d) {
        console.log("Click event triggered"); // Debug log
        if (d.link) {
          window.open(d.link, "_blank");
        }
      });

    // Modify the code where you create the Venn diagram labels
    chart.selectAll("text").attr("class", function (d) {
      if (d.sets.includes("A")) {
        return "venn-label venn-label-A";
      } else if (d.sets.includes("B")) {
        return "venn-label venn-label-B";
      } else {
        return "venn-label";
      }
    });
  });
});
