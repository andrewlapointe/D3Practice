import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = document.getElementById("solLeWitt").offsetWidth * 0.8;
const height = width * (1 / 1.6);
const n = 100;

const createSVG = (mask1, mask2) => {
  const svg = d3
    .select("#solLeWitt")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create background stripes.
  svg
    .append("g")
    .selectAll("rect") // Select all will modify all child elements of a type. Where there are none, it will create them.
    .data(d3.range(n))
    .join("rect")
    .attr("y", (d) => d * 20)
    .attr("width", width)
    .attr("height", 10)
    .attr("mask", `url(#${mask1})`);

  svg
    .append("g")
    .selectAll("rect") // Select all will modify all child elements of a type. Where there are none, it will create them.
    .data(d3.range(n))
    .join("rect")
    .attr("x", (d) => d * 20)
    .attr("width", 10)
    .attr("height", height)
    .attr("mask", `url(#${mask2})`);

  return svg;
};

// "d", by convention, refers to a row in the data array (in this case a range)
// The attr method can take either a function or a value as input

// Create circle mask
const renderMask = (selection, id, shapeID, inverted) => {
  const mask = selection.append("mask").attr("id", id);

  mask
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", inverted ? "black" : "white");

  mask
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`)
    .append("path")
    .attr("d", d3.symbol(d3.symbols[shapeID], 100000)())
    .attr("fill", inverted ? "white" : "black");
};

function isEven(n) {
  return n % 2 == 0;
}

for (let i = 0; i < 7; i++) {
  const svg = createSVG(`svg${i}-mask1`, `svg${i}-mask2`);
  svg
    .call(renderMask, `svg${i}-mask1`, i, isEven(i) ? false : true)
    .call(renderMask, `svg${i}-mask2`, i, isEven(i) ? true : false);
}
// const svg1 = createSVG("mask1", "mask2");
// renderMask(svg1, "mask1", 0, false);
// renderMask(svg1, "mask2", 0, true);
