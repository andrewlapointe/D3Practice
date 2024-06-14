// const SVGwidth = document.getElementById("chart").offsetWidth * 0.8;
// const SVGheight = 2 * (SVGwidth / 3);

const sectionID = "statParaTest";
const dataRelPath = "data/statistical_parametric_test.csv";
const yAxisLabelText = "xAxis";
const xAxisLabelText = "yAxis";

const xValue = (d) => d["FDR"];
const yValue = (d) => d["-log10(p)"];

function parser(d) {
  for (var key in d) {
    if (d.hasOwnProperty(key)) {
      d[key] = numberParser(d[key]);
    }
  }
  return d;
}

// function to turn string into number if possible
function numberParser(value) {
  return +value ? +value : value;
}

function createScatterPlot(
  dataFile,
  containerID,
  containerWidth,
  containerHeight,
  margin = { top: 10, right: 30, bottom: 50, left: 70 }
) {
  // set the dimensions and margins of the graph
  const width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;

  var zoom = d3
    .zoom()
    .scaleExtent([1, 2000])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", zoomFunction);
  function zoomFunction(d) {
    var transform = d3.zoomTransform(this);
    d3.selectAll(".dot")
      .attr("transform", transform)
      .attr("r", 3 / Math.sqrt(transform.k));
    xLabel.call(xAxis.scale(transform.rescaleX(xScale)));
    yLabel.call(yAxis.scale(transform.rescaleY(yScale)));
    svg
      .selectAll(".threshold")
      .attr("transform", transform)
      .attr("stroke-width", 1 / transform.k);
    svg
      .select(".x.grid")
      .call(
        make_x_gridlines()
          .tickSize(-innerHeight)
          .tickFormat("")
          .scale(transform.rescaleX(xScale))
      );
  }

  // append the svg object to the body of the page
  const svg = d3
    .select(`#${containerID}`)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  const renderViz = async () => {
    const data = await d3.csv(dataFile, parser);
    // console.log(data);
    // Add X axis
    const x = d3.scaleLinear().domain([0, 1600]).range([0, width]);
    const xAxis = svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add X axis label
    xAxis
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 10)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xAxisLabelText);

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 20]).range([height, 0]);
    const yAxis = svg.append("g").call(d3.axisLeft(y));

    // Add Y axis label
    yAxis
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(yAxisLabelText);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 20]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    const marks = data.map((d) => ({
      x: x(xValue(d)) * 10_000,
      y: y(yValue(d)),
    }));
    console.log(marks);

    // Add dots
    svg
      .append("g")
      .selectAll("dot")
      .data(marks)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 1.5)
      .style("fill", "#69b3a2");
  };
  renderViz();
}

createScatterPlot(dataRelPath, sectionID, SVGwidth, SVGheight);
