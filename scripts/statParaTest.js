// const SVGwidth = document.getElementById("chart").offsetWidth * 0.8;
// const SVGheight = 2 * (SVGwidth / 3);

const sectionID = "statParaTest";
const dataRelPath = "data/statistical_parametric_test.csv";
const yAxisLabelText = "";
const xAxisLabelText = "";

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
  constainerHeight,
  margin = { top: 10, right: 30, bottom: 30, left: 60 }
) {
  // set the dimensions and margins of the graph
  const width = containerWidth - margin.left - margin.right,
    height = constainerHeight - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select(`#${containerID}`)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Read the data
  const renderViz = async () => {
    const data = await d3.csv(dataFile, parser);
    // Add X axis
    const x = d3.scaleLinear().domain([0, 1600]).range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear().domain([0, 20]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    const marks = data.map((d) => ({
      x: x(xValue(d)),
      y: y(yValue(d)),
    }));

    // Add dots
    svg
      .append("g")
      .selectAll("dot")
      .data(marks)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d.GrLivArea);
      })
      .attr("cy", function (d) {
        return y(d.SalePrice);
      })
      .attr("r", 1.5)
      .style("fill", "#69b3a2");
  };
  renderViz();
}

createScatterPlot(dataRelPath, sectionID, SVGwidth, SVGheight);
