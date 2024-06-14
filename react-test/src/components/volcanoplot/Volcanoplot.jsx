import "./volcanoplot.css";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import data from "../../data/volcano.csv";

const VolcanoPlot = () => {
  const chartRef = useRef();

  useEffect(() => {
    const SVGwidth = chartRef.current.offsetWidth * 0.8;
    const SVGheight = 2 * (SVGwidth / 3);
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = SVGwidth - margin.left - margin.right;
    const innerHeight = SVGheight - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().range([0, innerWidth]).domain([-8, 8]);
    const yScale = d3.scaleLinear().range([innerHeight, 0]).domain([-1, 20]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // zoom = d3
    //   .zoom()
    //   .scaleExtent([1, 2000])
    //   .translateExtent([
    //     [0, 0],
    //     [width, height],
    //   ])
    //   .on("zoom", zoomFunction);

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", SVGwidth)
      .attr("height", SVGheight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    // .call(zoom);

    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    const gX = svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    const gY = svg.append("g").attr("class", "y axis").call(yAxis);

    //add x axis label
    gX.append("text")
      .attr("class", "label")
      .attr("transform", `translate(${innerWidth / 2},${margin.bottom - 6})`)
      .attr("text-anchor", "middle")
      .text("log₂(Fold-change)");

    //add y axis label
    gY.append("text")
      .attr("class", "label")
      .attr(
        "transform",
        `translate(${-margin.left / 1.25},${innerHeight / 2}) rotate(-90)`
      )
      .attr("text-anchor", "middle")
      .text("-log₁₀(p-value)");

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    d3.csv(data, parser).then((data) => {
      svg
        .selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", circleClass)
        .attr("r", 3)
        .attr("cx", (d) => xScale(d["log2(FC)"]))
        .attr("cy", (d) => yScale(d["-log10(p)"]))
        .on("mouseenter", function (event, d) {
          tooltip.style(
            "visibility",
            "visible"
          ).html(`<strong>Primary Accession</strong>: ${d[""]}<br/>
                   <strong>FC</strong>: ${d["FC"]}<br/>
                   <strong>log2(FC)</strong>: ${d3.format(".2f")(
                     d["log2(FC)"]
                   )}<br/>
                   <strong>Raw PVal</strong>: ${d["raw.pval"]}<br/>
                   <strong>-log10(p)</strong>: ${d["-log10(p)"]}`);
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
    });

    function circleClass(d) {
      if (d["-log10(p)"] <= 1) {
        return "dot";
      } else if (d["-log10(p)"] > 1 && d["log2(FC)"] <= -1) {
        return "dot sigfold";
      } else if (d["-log10(p)"] > 1 && d["log2(FC)"] >= 1) {
        return "dot sig";
      } else {
        return "dot";
      }
    }

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

    svg
      .append("rect")
      .attr("class", "zoom")
      .attr("height", innerHeight)
      .attr("width", innerWidth);

    // var circles = svg.append("g").attr("class", "circlesContainer");

    var thresholdLines = svg.append("g").attr("class", "thresholdLines");

    // add horizontal line at x = -1, 1 and vertical lines at y= -1, 1
    [-1, 1].forEach(function (threshold) {
      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", yScale(threshold))
        .attr("y2", yScale(threshold));

      thresholdLines
        .append("svg:line")
        .attr("class", "threshold")
        .attr("x1", xScale(threshold))
        .attr("x2", xScale(threshold))
        .attr("y1", 0)
        .attr("y2", innerHeight);
    });

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

    function zoomFunction(event) {
      const transform = event.transform;
      svg
        .selectAll(".dot")
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

    return () => {
      d3.select(chartRef.current).selectAll("*").remove();
      tooltip.remove();
    };
  });

  return <div ref={chartRef} id="chart"></div>;
};

export default VolcanoPlot;
