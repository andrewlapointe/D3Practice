const sectionID = "statParaTest";
const dataRelPath = "data/statistical_parametric_test.csv";
const yAxisLabelText = "yAxis";
const xAxisLabelText = "xAxis";

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
    height = containerHeight - margin.top - margin.bottom,
    x = d3.scaleLinear().domain([0, 1600]).range([0, width]),
    y = d3.scaleLinear().domain([0, 20]).range([height, 0]);

  // append the svg object to the body of the page

  function circleClass(d) {
    if (d.y <= 1) {
      return "dot";
    } else if (d.y > 1 && d.x <= -1) {
      return "dot sigfold";
    } else if (d.x > 1 && d.y >= 1) {
      return "dot sig";
    } else {
      return "dot";
    }
  }

  const renderViz = async () => {
    const data = await d3.csv(dataFile, parser);

    const zoom = d3
      .zoom()
      .scaleExtent([1, 20000])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        const transform = event.transform;
        const rescaleX = transform.rescaleX(x);
        const rescaleY = transform.rescaleY(y);
        xAxis.call(d3.axisBottom(rescaleX));
        yAxis.call(d3.axisLeft(rescaleY));
        svg
          .selectAll(".dot")
          .attr("transform", transform)
          .attr("r", 3 / (2 * Math.sqrt(transform.k)));
      });

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
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    const zoomBox = svg
      .append("rect")
      .attr("class", "zoom")
      .attr("height", innerHeight)
      .attr("width", innerWidth);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltipvolcano");

    function tipEnter(_, d) {
      // console.log(JSON.stringify(d));
      tooltip
        .style("visibility", "visible")
        .style("font-size", "11px")
        .html(
          "<strong>Protein</strong>: " +
            d.name +
            "<br/>" +
            "<strong>-log10(p)</strong>: " +
            d.y +
            "<br/>" +
            "<strong>FDR</strong>: " +
            d3.format(".2f")(d.x) +
            "<br/>" +
            "<strong>PVal</strong>: " +
            d.pVal +
            "<br/>" +
            "<strong>t.stat</strong>: " +
            d3.format(".2f")(d.tStat)
        );
    }
    function tipMove(event) {
      tooltip
        .style("top", event.pageY - 5 + "px")
        .style("left", event.pageX + 20 + "px");
    }

    // Add X axis
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

    const marks = data.map((d) => ({
      x: x(xValue(d) * 10_000),
      y: y(yValue(d)),
      name: d[""],
      pVal: d["p.value"],
      tStat: d["t.stat"],
    }));

    // Add dots
    const dots = svg
      .append("g")
      .attr("class", "dots")
      .selectAll("dot")
      .data(marks)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 1.5)
      .style("fill", "#69b3a2")
      .attr("class", circleClass)
      .on("mouseenter", tipEnter)
      .on("mousemove", tipMove)
      .on("mouseleave", () => tooltip.style("visibility", "hidden"))
      .on(
        "click",
        (_, d) => window.open("https://salivaryproteome.org/protein/" + d.name),
        "_blank"
      );

    // Add zoom
  };

  renderViz();
}

createScatterPlot(dataRelPath, sectionID, SVGwidth, SVGheight);
