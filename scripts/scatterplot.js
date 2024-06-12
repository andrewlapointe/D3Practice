// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const csv = d3.csv;
const select = d3.select;
const selectAll = d3.selectAll;
const SVGwidth = document.getElementById("dataJoin").offsetWidth * 0.8;
const SVGheight = SVGwidth * (1 / 1.6);

const csvUrl =
  "https://gist.githubusercontent.com/curran/a08a1080b88344b0c8a7/raw/0e7a9b0a5d22642a06d3d5b9bcbad9890c8ee534/iris.csv";

const parseRow = (d) => {
  d.sepal_length = +d.sepal_length;
  d.sepal_width = +d.sepal_width;
  d.petal_length = +d.petal_length;
  d.petal_width = +d.petal_width;
  d.species = d.species;
  return d;
};

const xValue = (d) => d.petal_length;
const yValue = (d) => d.sepal_length;
const sValue = (d) => d.species;

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 30,
};

function createSVG(selection) {
  return selection
    .append("svg")
    .attr("width", SVGwidth)
    .attr("height", SVGheight);
}
const scatterSection = select("#irisData");
const irisSVG = createSVG(scatterSection);

const main = async () => {
  const data = await csv(csvUrl, parseRow);
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([margin.left, SVGwidth - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue) + 1])
    .range([SVGheight - margin.bottom, margin.top]);

  const marks = data.map((d) => ({
    x: x(xValue(d)),
    y: y(yValue(d)),
    s: sValue(d),
  }));

  console.log(marks);

  irisSVG
    .selectAll("circle")
    .data(marks)
    .join("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 5)
    .attr("fill", (d) =>
      d.s === "setosa" ? d3.color("red") : d3.color("blue")
    );

  const yaxis = irisSVG
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  const xaxis = irisSVG
    .append("g")
    .attr("transform", `translate(0, ${SVGheight - margin.bottom})`)
    .call(d3.axisBottom(x));
};
main();
