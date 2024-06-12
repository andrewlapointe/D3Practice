import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataJoinsSection = d3.select("#dataJoin");
const SVGwidth = document.getElementById("dataJoin").offsetWidth * 0.8;
const SVGheight = SVGwidth * (1 / 1.6);

const sinSVG = dataJoinsSection
  .append("svg")
  .attr("height", SVGheight)
  .attr("width", SVGwidth);

// This method works, but it is better to decouple the logic of
// computing data and visualizing data.
// const data = d3.range(15);
// sinSVG
//   .selectAll("circle")
//   .data(data)
//   .enter()
//   .append("circle")
//   .attr("r", 10)
//   .attr("cx", (d) => 10 + d * 60)
//   .attr("cy", (d) => 250 + Math.sin(d * 0.5) * 200);

// Better way to do it:
let t = 0;
setInterval(() => {
  const data = d3.range(15).map((d) => ({
    x: 10 + d * 60,
    y: 250 + Math.sin(d * 0.5 + t) * 200,
  }));
  //   const circles = sinSVG.selectAll("circle").data(data);
  //   const circlesEnter = circles.enter().append("circle").attr("r", 10);
  //   circles
  //     .merge(circlesEnter)
  //     .attr("cx", (d) => d.x)
  //     .attr("cy", (d) => d.y);
  const circles = sinSVG
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 10)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y);

  t += 0.005;
}, 10);
