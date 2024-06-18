import "./volcanoplot.css";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import data from "../../data/all_data.tsv"; // static data import

const VolcanoPlot = ({
  foldChange = 2,
  pval = 0.05,
  xCol = 3,
  yCol = 4,
  details = [],
  xlabel = "",
  ylabel = "",
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const SVGwidth = chartRef.current.offsetWidth * 0.8;
    const SVGheight = 2 * (SVGwidth / 3.5);
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = SVGwidth - margin.left - margin.right;
    const innerHeight = SVGheight - margin.top - margin.bottom;

    // Creating the SVG container
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", SVGwidth)
      .attr("height", SVGheight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Defining the clip path to restrict drawing within the chart area
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    // Instantiating the tooltip
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    // Loading and parsing given data
    d3.tsv(data, parser).then((data) => {
      var datakeys = Object.keys(data[0]),
        xValKey = datakeys[xCol],
        yValKey = datakeys[yCol];

      // Determine the dynamic scales based on the data
      const xExtent = d3.extent(data, (d) => d[xValKey] * 1.1);
      const yExtent = d3.extent(data, (d) => d[yValKey] * 1.25);

      const xScale = d3
        .scaleLinear()
        .range([0, innerWidth])
        .domain([-0.1 * xExtent[1] + xExtent[0], xExtent[1]]);
      const yScale = d3
        .scaleLinear()
        .range([innerHeight, 0])
        .domain([-0.1 * yExtent[1] + yExtent[0], yExtent[1]]);

      // Instantiating x and y axis
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      // Setting up x axis
      const gX = svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);

      // Labeling x axis
      gX.append("text")
        .attr("class", "label")
        .attr("transform", `translate(${innerWidth / 2},${margin.bottom - 6})`)
        .attr("text-anchor", "middle")
        .text(xlabel === "" ? xValKey : xlabel);

      // Setting up y axis
      const gY = svg.append("g").attr("class", "y axis").call(yAxis);

      // Labeling y axis
      gY.append("text")
        .attr("class", "label")
        .attr(
          "transform",
          `translate(${-margin.left / 1.25},${innerHeight / 2}) rotate(-90)`
        )
        .attr("text-anchor", "middle")
        .text(ylabel === "" ? yValKey : ylabel);
      // Instantiate gridlines
      var gridLines = svg.append("g").attr("class", "grid");

      // Setup horizontal grid lines
      gridLines
        .append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + innerHeight + ")")
        .call(
          d3.axisBottom(xScale).ticks(10).tickSize(-innerHeight).tickFormat("")
        );

      // Setup vertical grid lines
      gridLines
        .append("g")
        .attr("class", "y grid")
        .call(
          d3.axisLeft(yScale).ticks(10).tickSize(-innerWidth).tickFormat("")
        );

      // Creates a rectangle that allows zooming to be done anywhere on the chart
      svg
        .append("rect")
        .attr("class", "zoom")
        .attr("height", innerHeight)
        .attr("width", innerWidth);

      // Instantiates thresholds separating circles by class
      const thresholdLines = svg.append("g").attr("class", "thresholdLines");

      // add horizontal lines at y= pval
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(pval))
        .attr("y2", yScale(pval));

      // add vertical lines at x = -foldChange, foldChange
      [-foldChange, foldChange].forEach(function (threshold) {
        thresholdLines
          .append("svg:line")
          .attr("class", "threshold")
          .attr("x1", xScale(threshold))
          .attr("x2", xScale(threshold))
          .attr("y1", 0)
          .attr("y2", innerHeight);
      });

      // bounds points to clip path
      const circleGroup = svg.append("g").attr("clip-path", "url(#clip)");

      circleGroup
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", circleClass)
        .attr("r", 4)
        .attr("cx", (d) => xScale(d[xValKey]))
        .attr("cy", (d) => yScale(d[yValKey]))
        .on("mouseenter", function (event, d) {
          tooltip.style("visibility", "visible").html(tooltipDetails(d));
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 5 + "px")
            .style("left", event.pageX + 20 + "px");
        })
        .on("mouseleave", function () {
          tooltip.style("visibility", "hidden");
        })
        .on(
          "click",
          (_, d) =>
            window.open("https://salivaryproteome.org/protein/" + d[""]),
          "_blank"
        );

      const legendDict = {
        1: ["DOWN", "Blue"],
        2: ["Non-SIG", "Gray"],
        3: ["UP", "Red"],
      };

      createLegend(svg, legendDict);

      const zoom = d3
        .zoom()
        .scaleExtent([1, 2000])
        .translateExtent([
          [0, 0],
          [SVGwidth, SVGheight],
        ])
        .on("zoom", zoomFunction);

      svg.call(zoom);

      function zoomFunction(event) {
        const transform = event.transform;
        svg
          .selectAll(".dot")
          .attr("transform", transform)
          .attr("r", 4 / Math.sqrt(transform.k));
        gX.call(xAxis.scale(transform.rescaleX(xScale)));
        gY.call(yAxis.scale(transform.rescaleY(yScale)));
        svg
          .selectAll(".threshold")
          .attr("transform", transform)
          .attr("stroke-width", 1 / transform.k);
        svg
          .select(".x.grid")
          .call(
            d3
              .axisBottom(xScale)
              .ticks(10)
              .tickSize(-innerHeight)
              .tickFormat("")
              .scale(transform.rescaleX(xScale))
          );
        svg
          .select(".y.grid")
          .call(
            d3
              .axisLeft(yScale)
              .ticks(10)
              .tickSize(-innerWidth)
              .tickFormat("")
              .scale(transform.rescaleY(yScale))
          );
      }

      // Function that dynamically creates a tooltip for a circle
      function tooltipDetails(d) {
        var output = `<strong>Primary Accession</strong>: ${d[datakeys[0]]}`;
        details.forEach(
          (detail) =>
            (output = output.concat(
              `<br/><strong>${detail}</strong>: ${d[detail]}`
            ))
        );
        return output;
      }

      function circleClass(d) {
        if (d[yValKey] <= pval) {
          return "dot";
        } else if (d[yValKey] > pval && d[xValKey] <= -foldChange) {
          return "dot sigfold";
        } else if (d[yValKey] > pval && d[xValKey] >= foldChange) {
          return "dot sig";
        } else {
          return "dot";
        }
      }
    });

    // Function to determine the class of a circle

    function parser(d) {
      for (let key in d) {
        if (d.hasOwnProperty(key)) {
          d[key] = numberParser(d[key]);
        }
      }
      return d;
    }

    function numberParser(value) {
      return +value ? +value : value;
    }

    // Function for creating a legend to be attached to a chart
    function createLegend(selection, legendDict) {
      const legend = selection
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(20, 20)");

      const legendItems = Object.keys(legendDict).map((key) => ({
        key,
        label: legendDict[key][0],
        color: legendDict[key][1],
      }));

      const legendItem = legend
        .selectAll(".legend-item")
        .data(legendItems)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

      legendItem
        .append("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .attr("fill", (d) => d.color);

      legendItem
        .append("text")
        .attr("x", 15)
        .attr("y", 9)
        .text((d) => d.label);
    }

    return () => {
      d3.select(chartRef.current).selectAll("*").remove();
      tooltip.remove();
    };
  }, []);

  return <div ref={chartRef} id="chart"></div>;
};

export default VolcanoPlot;
