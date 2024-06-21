import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import data from "../../data/statistical_parametric_test.csv";

const ScatterPlot = () => {
  const plotConfig = {
    dataFile: data,
    containerID: "statParaTest",
    width: 800,
    height: 400,
    margin: { top: 10, right: 30, bottom: 50, left: 70 },
    pointRadius: 3,
    xAxisLabel: "",
    yAxisLabel: "-log10(p)",
    xValue: (d, i) => i,
    yValue: (d) => d["-log10(p)"],
    circleClass: (d) => {
      if (d.y <= 1) {
        return "dot";
      } else if (d.y > 1 && d.x <= -1) {
        return "dot sigfold";
      } else if (d.x > 1 && d.y >= 1) {
        return "dot sig";
      } else {
        return "dot";
      }
    },
    tooltipHTML: (d) => {
      return `<strong>Protein</strong>: ${
        d[""]
      }<br/><strong>-log10(p)</strong>: ${
        d["-log10(p)"]
      }<br/><strong>FDR</strong>: ${d3.format(".2f")(
        d["FDR"]
      )}<br/><strong>PVal</strong>: ${
        d["p.value"]
      }<br/><strong>t.stat</strong>: ${d3.format(".2f")(d["t.stat"])}`;
    },
  };

  const parseData = (d) => {
    for (var key in d) {
      if (d.hasOwnProperty(key)) {
        d[key] = !isNaN(d[key]) ? +d[key] : d[key];
      }
    }
    return d;
  };

  const createScatterPlot = async (config, containerRef) => {
    const {
      dataFile,
      width,
      height,
      margin,
      pointRadius,
      xAxisLabel,
      yAxisLabel,
      xValue,
      yValue,
      circleClass,
      tooltipHTML,
    } = config;

    // Clear existing SVG elements
    d3.select(containerRef.current).selectAll("*").remove();

    const parentContainer = d3.select(containerRef.current);
    const svg = parentContainer
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${
          height + margin.top + margin.bottom
        }`
      )
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const clipPath = svg
      .append("clipPath")
      .attr("id", "clipRect")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    svg.node().addEventListener("wheel", (event) => event.preventDefault());
    // Append slider in the container for better layout control
    const slider = parentContainer
      .append("div")
      .attr("id", "zoom-slider-container")
      .append("input")
      .attr("type", "range")
      .attr("id", "zoom-slider")
      .attr("class", "sleek-slider")
      .attr("min", "0.5")
      .attr("max", "20")
      .attr("step", "0.1")
      .attr("value", "1")
      .style("width", "50%");

    document.getElementById("zoom-slider").disabled = true;
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = svg.append("g");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    const data = await d3.csv(dataFile, parseData);
    console.log("HERERWELSRJSLJFRLSEJKF");
    console.log(data);
    xScale.domain([0, data.length]);
    yScale.domain([0, d3.max(data, yValue)]);

    xAxis
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 10)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(xAxisLabel);

    yAxis
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text(yAxisLabel);

    var zoomBox = svg
      .append("rect")
      .attr("class", "zoom")
      .attr("height", height)
      .attr("width", width);

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 20])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", (event) => {
        const zx = event.transform.rescaleX(xScale);
        const zy = event.transform.rescaleY(yScale);
        xAxis.call(d3.axisBottom(zx));
        yAxis.call(d3.axisLeft(zy));
        svg
          .selectAll("circle")
          .attr("cx", (d, i) => zx(xValue(d, i)))
          .attr("cy", (d) => zy(yValue(d)));
        // Sync zoom level to the slider
        document.getElementById("zoom-slider").value = event.transform.k;
      });

    svg.call(zoom);

    const pltPointsGroup = svg
      .append("g")
      .attr("id", "points-group")
      .attr("clip-path", "url(#clipRect)")
      .attr("height", height)
      .attr("width", width);

    const pltPoints = pltPointsGroup
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => xScale(xValue(d, i)))
      .attr("cy", (d) => yScale(yValue(d)))
      .attr("r", pointRadius)
      .attr("class", circleClass)
      .on("mouseover", (_, d) => {
        tooltip.html(tooltipHTML(d)).style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      })
      .on(
        "click",
        (_, d) => window.open("https://salivaryproteome.org/protein/" + d[""]),
        "_blank"
      );
  };

  const containerRef = useRef(null);

  useEffect(() => {
    createScatterPlot(plotConfig, containerRef);
  }, []);

  return <div id="statParaTest" ref={containerRef}></div>;
};

export default ScatterPlot;
