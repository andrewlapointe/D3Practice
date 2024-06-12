function volcanoPlot() {
  var width = 960,
    height = 500,
    margin = { top: 20, right: 20, bottom: 40, left: 50 },
    xColumn, // name of the variable to be plotted on the axis
    yColumn,
    xAxisLabel, // label for the axis
    yAxisLabel,
    xAxisLabelOffset, // offset for the label of the axis
    yAxisLabelOffset,
    xTicks, // number of ticks on the axis
    yTicks,
    sampleID = "Gene",
    significanceThreshold = 1.0, // significance threshold to colour by
    foldChangeThreshold = 1.0, // fold change level to colour by
    colorRange, // colour range to use in the plot
    xScale = d3.scaleLinear(), // the values for the axes will be continuous
    yScale = d3.scaleLinear(); // change to linear scale for easier tick customization

  function chart(selection) {
    var innerWidth = width - margin.left - margin.right, // set the size of the chart within its container
      innerHeight = height - margin.top - margin.bottom;

    selection.each(function (data) {
      // set up the scaling for the axes based on the inner width/height of the chart and also the range
      // of value for the x and y axis variables. This range is defined by their min and max values as
      // calculated by d3.extent()
      xScale.range([0, innerWidth]).domain([-8, 8]); // set the x-axis range from -4 to 4

      // y-axis range from 0 to 15
      yScale.range([innerHeight, 0]).domain([-1, 20]);

      var zoom = d3
        .zoom()
        .scaleExtent([1, 20])
        .translateExtent([
          [0, 0],
          [width, height],
        ])
        .on("zoom", zoomFunction);

      // append the svg object to the selection
      var svg = d3
        .select(this)
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

      // position the reset button and attach reset function
      d3.select("#resetBtn")
        .style("top", margin.top * 1.5 + "px")
        .style("left", margin.left * 1.25 + "px")
        .on("click", reset);

      svg
        .append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("height", innerHeight)
        .attr("width", innerWidth);

      // add the axes
      var xAxis = d3.axisBottom(xScale).tickValues([-4, 0, 4]); // set the number of x-axis ticks
      var yAxis = d3.axisLeft(yScale).tickValues([0, 5, 10, 15]); // set specific y-axis ticks

      // add gridlines for x axis
      svg
        .append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat(""));

      // add gridlines for y axis
      svg
        .append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(""));

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

      // this rect acts as a layer so that zooming works anywhere in the svg. otherwise, if zoom is called on
      // just svg, zoom functionality will only work when the pointer is over a circle.
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
        .attr("cx", function (d) {
          return xScale(d[xColumn]);
        })
        .attr("cy", function (d) {
          return yScale(d[yColumn]);
        })
        .attr("class", circleClass)
        .on("mouseenter", tipEnter)
        .on("mousemove", tipMove)
        .on("mouseleave", function (d) {
          return tooltip.style("visibility", "hidden");
        });

      var thresholdLines = svg.append("g").attr("class", "thresholdLines");

      // add horizontal line at y = 1
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(1))
        .attr("y2", yScale(1));

      // add vertical line at x = 2
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", xScale(1))
        .attr("x2", xScale(1))
        .attr("y1", 0)
        .attr("y2", innerHeight);

      // add vertical line at x = -2
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", xScale(-1))
        .attr("x2", xScale(-1))
        .attr("y1", 0)
        .attr("y2", innerHeight);

      var tooltip = d3.select("body").append("div").attr("class", "tooltip");

      function tipEnter(d) {
        tooltip
          .style("visibility", "visible")
          .style("font-size", "11px")
          .html(
            "<strong>" +
              sampleID +
              "</strong>: " +
              d[sampleID] +
              "<br/>" +
              "<strong>" +
              xColumn +
              "</strong>: " +
              d3.format(".2f")(d[xColumn]) +
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

      function zoomFunction() {
        var transform = d3.zoomTransform(this);
        d3.selectAll(".dot")
          .attr("transform", transform)
          .attr("r", 3 / Math.sqrt(transform.k));
        gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
        svg
          .selectAll(".threshold")
          .attr("transform", transform)
          .attr("stroke-width", 1 / transform.k);
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

      function reset() {
        var ease = d3.easePolyIn.exponent(4.0);
        svg
          .transition()
          .duration(750)
          .ease(ease)
          .call(zoom.transform, d3.zoomIdentity);
      }

      // Append legend
      var legend = svg
        .append("g")
        .attr("class", "legend")
        .attr(
          "transform",
          "translate(" + (width - 150) + "," + (margin.top + 10) + ")"
        );

      legend
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 5)
        .style("fill", "blue");

      legend.append("text").attr("x", 10).attr("y", 5).text("DOWN");

      legend
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 20)
        .attr("r", 5)
        .style("fill", "red");

      legend.append("text").attr("x", 10).attr("y", 25).text("UP");
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

  chart.significanceThreshold = function (value) {
    if (!arguments.length) return significanceThreshold;
    significanceThreshold = value;
    return chart;
  };

  chart.foldChangeThreshold = function (value) {
    if (!arguments.length) return foldChangeThreshold;
    foldChangeThreshold = value;
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
