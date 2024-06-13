const SVGwidth = document.getElementById("chart").offsetWidth * 0.8;
const SVGheight = 2 * (SVGwidth / 3);

function volcanoPlot(width = SVGwidth, height = SVGheight) {
  var margin = { top: 20, right: 20, bottom: 40, left: 50 },
    xColumn, // name of the variable to be plotted on the axis
    yColumn,
    xAxisLabel, // label for the axis
    yAxisLabel,
    xAxisLabelOffset, // offset for the label of the axis
    yAxisLabelOffset,
    xTicks, // number of ticks on the axis
    yTicks,
    sampleID = "Gene",
    colorRange, // colour range to use in the plot
    xScale = d3.scaleLinear(), // the values for the axes will be continuous
    yScale = d3.scaleLinear();

  function chart(selection) {
    var innerWidth = width - margin.left - margin.right, // set the size of the chart within its container
      innerHeight = height - margin.top - margin.bottom;

    selection.each(function (data) {
      xScale.range([0, innerWidth]).domain([-8, 8]); // set the x-axis range from -8 to 8

      yScale.range([innerHeight, 0]).domain([-1, 20]); // set the y-axis range from -1 to 20 (log scale can't have 0 or negative values)

      var zoom = d3
        .zoom()
        .scaleExtent([1, 2000])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", zoomFunction);

      // append the svg object to the selection
      const svg = d3
        .select(this)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("height", innerHeight)
        .attr("width", innerWidth);

      // add the axes
      var xAxis = d3.axisBottom(xScale);
      var yAxis = d3.axisLeft(yScale);

      var gX = svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(xAxis);

      gX.append("text")
        .attr("class", "label")
        .attr(
          "transform",
          "translate(" + width / 2 + "," + (margin.bottom - 6) + ")"
        )
        .attr("text-anchor", "middle")
        .html(xAxisLabel || xColumn);

      var gY = svg.append("g").attr("class", "y axis").call(yAxis);

      gY.append("text")
        .attr("class", "label")
        .attr(
          "transform",
          "translate(" +
            (0 - margin.left / 1.25) +
            "," +
            height / 2 +
            ") rotate(-90)"
        )
        .style("text-anchor", "middle")
        .html(yAxisLabel || yColumn);

      // add gridlines
      var gridLines = svg.append("g").attr("class", "grid");

      function make_x_gridlines() {
        return d3.axisBottom(xScale).ticks(10);
      }

      function make_y_gridlines() {
        return d3.axisLeft(yScale).ticks(10);
      }

      gridLines
        .append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(make_x_gridlines().tickSize(-innerHeight).tickFormat(""));

      gridLines
        .append("g")
        .attr("class", "y grid")
        .call(make_y_gridlines().tickSize(-innerWidth).tickFormat(""));

      var zoomBox = svg
        .append("rect")
        .attr("class", "zoom")
        .attr("height", innerHeight)
        .attr("width", innerWidth);

      var circles = svg.append("g").attr("class", "circlesContainer");

      circles
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("cx", (d) => xScale(d[xColumn]))
        .attr("cy", (d) => yScale(d[yColumn]))
        .attr("class", circleClass)
        .on("mouseenter", tipEnter)
        .on("mousemove", tipMove)
        .on("mouseleave", () => tooltip.style("visibility", "hidden"))
        .on(
          "click",
          (_, d) =>
            window.open("https://salivaryproteome.org/protein/" + d[""]),
          "_blank"
        );

      var thresholdLines = svg.append("g").attr("class", "thresholdLines");

      // add horizontal line at y = 1
      [-1, 1].forEach(function (threshold) {
        thresholdLines
          .append("svg:line")
          .attr("class", "threshold")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", yScale(threshold))
          .attr("y2", yScale(threshold));
      });

      // add vertical line at x = 1
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", xScale(1))
        .attr("x2", xScale(1))
        .attr("y1", 0)
        .attr("y2", innerHeight);

      // add vertical line at x = -1
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", xScale(-1))
        .attr("x2", xScale(-1))
        .attr("y1", 0)
        .attr("y2", innerHeight);

      var tooltip = d3.select("body").append("div").attr("class", "tooltip");

      function tipEnter(_, d) {
        console.log(JSON.stringify(d));
        tooltip
          .style("visibility", "visible")
          .style("font-size", "11px")
          .html(
            "<strong>Primary Accession</strong>: " +
              d[""] +
              "<br/>" +
              "<strong>FC</strong>: " +
              d["FC"] +
              "<br/>" +
              "<strong>" +
              xColumn +
              "</strong>: " +
              d3.format(".2f")(d[xColumn]) +
              "<br/>" +
              "<strong>Raw PVal</strong>: " +
              d["raw.pval"] +
              "<br/>" +
              "<strong>" +
              yColumn +
              "</strong>: " +
              d[yColumn]
          );
      }

      function tipMove() {
        tooltip
          .style("top", event.pageY - 5 + "px")
          .style("left", event.pageX + 20 + "px");
      }

      function yTickFormat(n) {
        return d3.format(".2r")(getBaseLog(10, n));
        function getBaseLog(x, y) {
          return Math.log(y) / Math.log(x);
        }
      }

      function zoomFunction(d) {
        var transform = d3.zoomTransform(this);
        d3.selectAll(".dot")
          .attr("transform", transform)
          .attr("r", 3 / Math.sqrt(transform.k));
        gX.call(xAxis.scale(transform.rescaleX(xScale)));
        gY.call(yAxis.scale(transform.rescaleY(yScale)));
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

        svg
          .select(".y.grid")
          .call(
            make_y_gridlines()
              .tickSize(-innerWidth)
              .tickFormat("")
              .scale(transform.rescaleY(yScale))
          );
      }

      function circleClass(d) {
        if (d[yColumn] <= 1) {
          return "dot";
        } else if (d[yColumn] > 1 && d[xColumn] <= -1) {
          return "dot sigfold";
        } else if (d[yColumn] > 1 && d[xColumn] >= 1) {
          return "dot sig";
        } else {
          return "dot";
        }
      }

      function createLegend(selection, legendDict) {
        // takes svg d3 selection and adds a legend
        // legendDict must be a dictionary with:
        // KEY - number
        // VALUE - an array of 2 elements [str:Label, str:Color]

        var legend = selection
          .append("g")
          .attr("class", "legend")
          .attr("transform", "translate(20, 20)"); // Adjust the position as needed

        var legendItems = Object.keys(legendDict).map(function (key) {
          return {
            key: key,
            label: legendDict[key][0],
            color: legendDict[key][1],
          };
        });

        var legendItem = legend
          .selectAll(".legend-item")
          .data(legendItems)
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
          });

        // Add circles
        legendItem
          .append("circle")
          .attr("cx", 5)
          .attr("cy", 5)
          .attr("r", 5)
          .attr("fill", function (d) {
            return d.color;
          });

        // Add text
        legendItem
          .append("text")
          .attr("x", 15)
          .attr("y", 9)
          .text(function (d) {
            return d.label;
          });
      }

      legendDict = {
        1: ["DOWN", "Blue"],
        2: ["Non-SIG", "Gray"],
        3: ["UP", "Red"],
      };
      const legend = createLegend(svg, legendDict);
    });
  }

  chart.width = function (value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function (value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.margin = function (value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.xColumn = function (value) {
    if (!arguments.length) return xColumn;
    xColumn = value;
    return chart;
  };

  chart.yColumn = function (value) {
    if (!arguments.length) return yColumn;
    yColumn = value;
    return chart;
  };

  chart.xAxisLabel = function (value) {
    if (!arguments.length) return xAxisLabel;
    xAxisLabel = value;
    return chart;
  };

  chart.yAxisLabel = function (value) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = value;
    return chart;
  };

  chart.xAxisLabelOffset = function (value) {
    if (!arguments.length) return xAxisLabelOffset;
    xAxisLabelOffset = value;
    return chart;
  };

  chart.yAxisLabelOffset = function (value) {
    if (!arguments.length) return yAxisLabelOffset;
    yAxisLabelOffset = value;
    return chart;
  };

  chart.xTicks = function (value) {
    if (!arguments.length) return xTicks;
    xTicks = value;
    return chart;
  };

  chart.yTicks = function (value) {
    if (!arguments.length) return yTicks;
    yTicks = value;
    return chart;
  };

  chart.colorRange = function (value) {
    if (!arguments.length) return colorRange;
    colorRange = value;
    return chart;
  };

  chart.sampleID = function (value) {
    if (!arguments.length) return sampleID;
    sampleID = value;
    return chart;
  };

  return chart;
}

var yLabel = '-log<tspan baseline-shift="sub">10</tspan>(p-value)',
  xLabel = 'log<tspan baseline-shift="sub">2</tspan>(Fold-change)',
  file = "../data/volcano.csv";

var volcanoPlot = volcanoPlot()
  .xAxisLabel(xLabel)
  .yAxisLabel(yLabel)
  .sampleID("")
  .xColumn("log2(FC)")
  .yColumn("-log10(p)");

d3.csv(file, parser)
  .then(function (data) {
    console.log([data]);
    d3.select("#chart").data([data]).call(volcanoPlot);
  })
  .catch(function (error) {
    console.log(error);
  });

// row parser to convert key values into numbers if possible
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
