// Load the CSV data
d3.csv("./data/data_original.csv").then(function (data) {
  // Extract numeric columns for density plot
  const numericColumns = data.columns.filter(
    (column) => column !== "" && column !== "Label"
  );

  // Extract the first numeric column for density plot (e.g., "HSPP_DW_2155.97")
  const columnKey = numericColumns[0];

  // Prepare data for density plot
  const densityValues = data.map((d) => parseFloat(d[columnKey]));

  // Set up dimensions and margins for density plot
  const densityMargin = { top: 20, right: 40, bottom: 60, left: 250 };
  const densityWidth = 800 - densityMargin.left - densityMargin.right;
  const densityHeight = 420 - densityMargin.top - densityMargin.bottom;

  // Append SVG to the chart div for density plot
  const densitySvg = d3
    .select("#beforeDensityChart")
    .append("svg")
    .attr("width", densityWidth + densityMargin.left + densityMargin.right)
    .attr("height", densityHeight + densityMargin.top + densityMargin.bottom)
    .append("g")
    .attr(
      "transform",
      `translate(${densityMargin.left}, ${densityMargin.top})`
    );

  // Set up initial scales for density plot
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(densityValues))
    .nice()
    .range([0, densityWidth]);

  const kde = kernelDensityEstimator(
    epanechnikovKernel(0.5),
    xScale.ticks(100)
  );
  const densityData = kde(densityValues);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(densityData, (d) => d[1])])
    .nice()
    .range([densityHeight, 0]);

  // Create line generator for density plot
  const line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  // Draw initial density plot line
  densitySvg
    .append("path")
    .datum(densityData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Add points to the line
  densitySvg
    .selectAll(".point")
    .data(densityData)
    .enter()
    .append("circle")
    .attr("class", "point")
    .attr("cx", (d) => xScale(d[0]))
    .attr("cy", (d) => yScale(d[1]))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .style("opacity", 0);

  // Add x axis
  densitySvg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${densityHeight})`)
    .call(d3.axisBottom(xScale));

  // Add y axis
  densitySvg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  // Axis labels
  densitySvg
    .append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", densityWidth / 2)
    .attr("y", densityHeight + densityMargin.bottom - 5)
    .text("Value");

  densitySvg
    .append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -densityHeight / 2)
    .attr("y", -densityMargin.left + 200)
    .text("Density");

  // Add tooltip div for density plot
  const densityTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px");

  // Add mouseover and mouseout handlers for line and points
  densitySvg
    .selectAll(".point")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "orange").style("opacity", 1);
      densityTooltip.transition().duration(200).style("opacity", 0.9);
      densityTooltip
        .html(
          `<strong>Value:</strong> ${d[0].toFixed(
            2
          )} <br> <strong>Density:</strong> ${d[1].toFixed(2)}`
        )
        .style("left", `${event.pageX + 15}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      d3.select(this).attr("fill", "steelblue").style("opacity", 0);
      densityTooltip.transition().duration(500).style("opacity", 0);
    });

  densitySvg.on("mousemove", function (event) {
    densityTooltip
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 28}px`);
  });

  // Function to update tooltip position
  function updateDensityTooltip(event) {
    const mouseX = d3.pointer(event)[0];
    const x0 = xScale.invert(mouseX);
    const bisect = d3.bisector((d) => d[0]).left;
    const index = bisect(densityData, x0, 1);
    const d = densityData[index];
    densityTooltip
      .html(
        `<strong>Value:</strong> ${d[0].toFixed(
          2
        )} <br> <strong>Density:</strong> ${d[1].toFixed(2)}`
      )
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY - 28}px`);
  }

  // Boxplot setup
  const boxMargin = { top: 10, right: 30, bottom: 50, left: 250 };
  const boxWidth = 800 - boxMargin.left - boxMargin.right;
  const boxHeight = 800 - boxMargin.top - boxMargin.bottom;

  const labels = data.map((d) => d[""]);
  const boxValues = data.map((d) =>
    Object.values(d)
      .slice(1)
      .map((v) => +v)
  );

  const sumstats = boxValues.map((rowValues, i) => {
    const sortedValues = rowValues.sort(d3.ascending);
    const q1 = d3.quantile(sortedValues, 0.25);
    const median = d3.quantile(sortedValues, 0.5);
    const q3 = d3.quantile(sortedValues, 0.75);
    const interQuantileRange = q3 - q1;
    const min = q1 - 1.5 * interQuantileRange;
    const max = q3 + 1.5 * interQuantileRange;
    const outliers = sortedValues.filter((v) => v < min || v > max);
    return {
      label: labels[i],
      q1,
      median,
      q3,
      min,
      max,
      iqr: interQuantileRange,
      outliers,
      values: rowValues,
    };
  });

  // Sort the sumstats by median value in descending order and take the top 30
  sumstats.sort((a, b) => b.median - a.median);
  const topSumstats = sumstats.slice(1, 31);

  const topLabels = topSumstats.map((d) => d.label);
  const allValues = topSumstats.flatMap((d) => d.values);
  const xMin = d3.min(allValues) - 3.2;
  const xMax = d3.max(allValues) + 1;

  const boxSvg = d3
    .select("#beforeBoxplots")
    .append("svg")
    .attr("width", boxWidth + boxMargin.left + boxMargin.right)
    .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
    .append("g")
    .attr("transform", `translate(${boxMargin.left}, ${boxMargin.top})`);

  boxSvg.node().addEventListener("wheel", (event) => event.preventDefault());

  const y = d3
    .scaleBand()
    .domain(topLabels)
    .range([0, boxHeight])
    .paddingInner(1)
    .paddingOuter(0.2);

  // boxSvg
  //   .append("defs")
  //   .append("clipPath")
  //   .attr("id", "clip")
  //   .append("rect")
  //   .attr("height", boxHeight)
  //   .attr("width", boxWidth);

  const xScaleBox = d3.scaleLinear().domain([xMin, xMax]).range([0, boxWidth]);

  const xAxisBox = boxSvg
    .append("g")
    .attr("transform", `translate(0, ${boxHeight})`)
    .call(d3.axisBottom(xScaleBox));
  const yAxisBox = boxSvg
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "10px");

  const boxTooltip = d3.select("body").append("div").attr("class", "tooltip");

  const showBoxTooltip = function (event, d) {
    boxTooltip
      .style("opacity", 1)
      .html(
        `Label: ${d.label}<br>Q1: ${d.q1}<br>Median: ${d.median}<br>Q3: ${d.q3}<br>IQR: ${d.iqr}<br>Min: ${d.min}<br>Max: ${d.max}<br>Outliers: ${d.outliers.length}`
      )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 10 + "px");
  };

  const hideBoxTooltip = function () {
    boxTooltip.style("opacity", 0);
  };

  const boxes = boxSvg
    .selectAll(".boxplot")
    .data(topSumstats)
    .enter()
    .append("a")
    .attr(
      "href",
      (d) =>
        `https://salivaryproteome.org/protein/${encodeURIComponent(d.label)}`
    )
    .attr("target", "_blank")
    .append("g")
    .attr("class", "boxplot")
    .attr("transform", (d) => `translate(0,${y(d.label)})`);

  boxes.each(function (d) {
    const g = d3.select(this);

    g.append("line")
      .attr("class", "whisker")
      .attr("x1", xScaleBox(d.min))
      .attr("y1", 0)
      .attr("x2", xScaleBox(d.max))
      .attr("y2", 0);

    g.append("rect")
      .attr("class", "box")
      .attr("x", xScaleBox(d.q1))
      .attr("y", -10)
      .attr("width", xScaleBox(d.q3) - xScaleBox(d.q1))
      .attr("height", 20)
      .style("fill", "#69b3a2");

    g.append("line")
      .attr("class", "median")
      .attr("x1", xScaleBox(d.median))
      .attr("y1", -10)
      .attr("x2", xScaleBox(d.median))
      .attr("y2", 10);

    g.append("line")
      .attr("class", "min-line")
      .attr("x1", xScaleBox(d.min))
      .attr("y1", -10)
      .attr("x2", xScaleBox(d.min))
      .attr("y2", 10);

    g.append("line")
      .attr("class", "max-line")
      .attr("x1", xScaleBox(d.max))
      .attr("y1", -10)
      .attr("x2", xScaleBox(d.max))
      .attr("y2", 10);

    const outliers = g
      .selectAll(".outlier")
      .data(d.outliers)
      .enter()
      .append("circle")
      .attr("class", "outlier")
      .attr("cx", (v) => xScaleBox(v))
      .attr("cy", 0)
      .attr("r", 3)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);

    g.on("mouseover", function (event, d) {
      showBoxTooltip(event, d);
      d3.select(this)
        .select(".box")
        .style("fill", "#ff9900")
        .attr("height", 30)
        .attr("y", -15);
      d3.select(this)
        .selectAll(".min-line, .max-line")
        .style("stroke", "#ff9900")
        .attr("stroke-width", 3);
      outliers.attr("fill", "#ff9900").attr("r", 5);
    })
      .on("mousemove", (event, d) => showBoxTooltip(event, d))
      .on("mouseleave", function () {
        hideBoxTooltip();
        d3.select(this)
          .select(".box")
          .style("fill", "#69b3a2")
          .attr("height", 20)
          .attr("y", -10);
        d3.select(this)
          .selectAll(".min-line, .max-line")
          .style("stroke", "black")
          .attr("stroke-width", 1.5);
        outliers.attr("fill", "white").attr("r", 3);
      });
  });

  const zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", zoomed);

  boxSvg.call(zoom);

  function zoomed(event) {
    const newX = event.transform.rescaleX(xScaleBox);
    xAxisBox.call(d3.axisBottom(newX));

    boxes.attr("transform", (d) => `translate(0,${y(d.label)})`);
    boxes
      .selectAll(".whisker")
      .attr("x1", (d) => newX(d.min))
      .attr("x2", (d) => newX(d.max));
    boxes
      .selectAll(".box")
      .attr("x", (d) => newX(d.q1))
      .attr("width", (d) => newX(d.q3) - newX(d.q1));
    boxes
      .selectAll(".median")
      .attr("x1", (d) => newX(d.median))
      .attr("x2", (d) => newX(d.median));
    boxes
      .selectAll(".min-line")
      .attr("x1", (d) => newX(d.min))
      .attr("x2", (d) => newX(d.min));
    boxes
      .selectAll(".max-line")
      .attr("x1", (d) => newX(d.max))
      .attr("x2", (d) => newX(d.max));
    boxes.selectAll(".outlier").attr("cx", (d) => newX(d));
  }

  window.addEventListener("resize", function () {
    updateDensityPlot();
    updateBoxplots();
  });

  // Function to update density plot dimensions and scales
  function updateDensityPlot() {
    // Update density plot dimensions based on available space
    const densityWidth = 800 - densityMargin.left - densityMargin.right;
    const densityHeight = 500 - densityMargin.top - densityMargin.bottom;

    // Update xScale and yScale domains based on the updated data
    xScale.domain(d3.extent(densityValues)).nice().range([0, densityWidth]);

    const kde = kernelDensityEstimator(
      epanechnikovKernel(0.5),
      xScale.ticks(100)
    );
    densityData = kde(densityValues);

    yScale
      .domain([0, d3.max(densityData, (d) => d[1])])
      .nice()
      .range([densityHeight, 0]);

    // Update SVG dimensions
    densitySvg
      .attr("width", densityWidth + densityMargin.left + densityMargin.right)
      .attr("height", densityHeight + densityMargin.top + densityMargin.bottom);

    // Update x-axis and y-axis
    densitySvg.select(".x-axis").call(d3.axisBottom(xScale));
    densitySvg.select(".y-axis").call(d3.axisLeft(yScale));

    // Update axis labels
    densitySvg.select(".x-label").attr("x", densityWidth / 2);
    densitySvg.select(".y-label").attr("y", -densityMargin.left + 15);

    // Update density plot line
    densitySvg.select("path").datum(densityData).attr("d", line);

    // Update points on the line
    densitySvg
      .selectAll(".point")
      .data(densityData)
      .attr("cx", (d) => xScale(d[0]))
      .attr("cy", (d) => yScale(d[1]));

    // Update tooltip position
    densitySvg.on("mousemove", updateDensityTooltip);
  }

  // Function to update box plots dimensions and scales
  function updateBoxplots() {
    // Update box plot dimensions based on available space
    const boxWidth = 800 - boxMargin.left - boxMargin.right;
    const boxHeight = 800 - boxMargin.top - boxMargin.bottom;

    // Update xScaleBox and y domains based on the updated data
    xScaleBox.domain([xMin, xMax]).range([0, boxWidth]);
    y.domain(topLabels).range([0, boxHeight]);

    // Update SVG dimensions
    boxSvg
      .attr("width", boxWidth + boxMargin.left + boxMargin.right)
      .attr("height", boxHeight + boxMargin.top + boxMargin.bottom);

    // Update x-axis and y-axis
    xAxisBox.call(d3.axisBottom(xScaleBox));
    yAxisBox.call(d3.axisLeft(y)).selectAll("text").style("font-size", "10px");

    // Update each box plot
    boxes.attr("transform", (d) => `translate(0,${y(d.label)})`);

    boxes
      .selectAll(".whisker")
      .attr("x1", (d) => xScaleBox(d.min))
      .attr("x2", (d) => xScaleBox(d.max));

    boxes
      .selectAll(".box")
      .attr("x", (d) => xScaleBox(d.q1))
      .attr("width", (d) => xScaleBox(d.q3) - xScaleBox(d.q1));

    boxes
      .selectAll(".median")
      .attr("x1", (d) => xScaleBox(d.median))
      .attr("x2", (d) => xScaleBox(d.median));

    boxes
      .selectAll(".min-line")
      .attr("x1", (d) => xScaleBox(d.min))
      .attr("x2", (d) => xScaleBox(d.min));

    boxes
      .selectAll(".max-line")
      .attr("x1", (d) => xScaleBox(d.max))
      .attr("x2", (d) => xScaleBox(d.max));

    boxes.selectAll(".outlier").attr("cx", (d) => xScaleBox(d));

    // Update tooltip position
    boxSvg.on("mousemove", function (event) {
      boxTooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    });
  }
});

// Kernel density estimator function
function kernelDensityEstimator(kernel, x) {
  return function (sample) {
    return x.map(function (x) {
      return [
        x,
        d3.mean(sample, function (v) {
          return kernel(x - v);
        }),
      ];
    });
  };
}

// Epanechnikov kernel function
function epanechnikovKernel(scale) {
  return function (u) {
    return Math.abs((u /= scale)) <= 1 ? (0.75 * (1 - u * u)) / scale : 0;
  };
}

// Function to update density plot tooltip position
function updateDensityTooltip(event) {
  const mouseX = d3.pointer(event)[0];
  const x0 = xScale.invert(mouseX);
  const bisect = d3.bisector((d) => d[0]).left;
  const index = bisect(densityData, x0, 1);
  const d = densityData[index];
  tooltip
    .html(
      `<strong>Value:</strong> ${d[0].toFixed(
        2
      )} <br> <strong>Density:</strong> ${d[1].toFixed(2)}`
    )
    .style("left", `${event.pageX + 15}px`)
    .style("top", `${event.pageY - 28}px`);
}

// Function to update box plot tooltip position
function updateBoxplotTooltip(event, d) {
  boxTooltip
    .style("opacity", 1)
    .html(
      `Label: ${d.label}<br>Q1: ${d.q1}<br>Median: ${d.median}<br>Q3: ${d.q3}<br>IQR: ${d.iqr}<br>Min: ${d.min}<br>Max: ${d.max}<br>Outliers: ${d.outliers.length}`
    )
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 10}px`);
}

// Update density plot on window resize
function updateDensityPlot() {
  // Update dimensions and scales
  densityWidth = 800 - densityMargin.left - densityMargin.right;
  densityHeight = 500 - densityMargin.top - densityMargin.bottom;

  xScale.range([0, densityWidth]);
  const kde = kernelDensityEstimator(
    epanechnikovKernel(0.5),
    xScale.ticks(100)
  );
  densityData = kde(densityValues);

  yScale.domain([0, d3.max(densityData, (d) => d[1])]).nice();

  // Update SVG and elements
  densitySvg
    .attr("width", densityWidth + densityMargin.left + densityMargin.right)
    .attr("height", densityHeight + densityMargin.top + densityMargin.bottom);

  densitySvg.select(".x-axis").call(d3.axisBottom(xScale));
  densitySvg.select(".y-axis").call(d3.axisLeft(yScale));

  densitySvg.select(".x-label").attr("x", densityWidth / 2);
  densitySvg.select(".y-label").attr("y", -densityMargin.left + 15);

  densitySvg.select("path").datum(densityData).attr("d", line);

  densitySvg
    .selectAll(".point")
    .data(densityData)
    .attr("cx", (d) => xScale(d[0]))
    .attr("cy", (d) => yScale(d[1]));

  // Update tooltip position
  densitySvg.on("mousemove", updateDensityTooltip);
}

// Update box plots on window resize
function updateBoxplots() {
  // Update dimensions and scales
  boxWidth = 800 - boxMargin.left - boxMargin.right;
  boxHeight = 800 - boxMargin.top - boxMargin.bottom;

  xScaleBox.range([0, boxWidth]);
  y.range([0, boxHeight]);

  // Update SVG and elements
  boxSvg
    .attr("width", boxWidth + boxMargin.left + boxMargin.right)
    .attr("height", boxHeight + boxMargin.top + boxMargin.bottom);

  xAxisBox.call(d3.axisBottom(xScaleBox));
  yAxisBox.call(d3.axisLeft(y)).selectAll("text").style("font-size", "10px");

  boxes.attr("transform", (d) => `translate(0,${y(d.label)})`);

  boxes
    .selectAll(".whisker")
    .attr("x1", (d) => xScaleBox(d.min))
    .attr("x2", (d) => xScaleBox(d.max));

  boxes
    .selectAll(".box")
    .attr("x", (d) => xScaleBox(d.q1))
    .attr("width", (d) => xScaleBox(d.q3) - xScaleBox(d.q1));

  boxes
    .selectAll(".median")
    .attr("x1", (d) => xScaleBox(d.median))
    .attr("x2", (d) => xScaleBox(d.median));

  boxes
    .selectAll(".min-line")
    .attr("x1", (d) => xScaleBox(d.min))
    .attr("x2", (d) => xScaleBox(d.min));

  boxes
    .selectAll(".max-line")
    .attr("x1", (d) => xScaleBox(d.max))
    .attr("x2", (d) => xScaleBox(d.max));

  boxes.selectAll(".outlier").attr("cx", (d) => xScaleBox(d));

  // Update tooltip position
  boxSvg.on("mousemove", function (event) {
    boxTooltip
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY - 10}px`);
  });
}

// Listen to window resize event to update plots
window.addEventListener("resize", function () {
  updateDensityPlot();
  updateBoxplots();
});

// Kernel density estimator function
function kernelDensityEstimator(kernel, x) {
  return function (sample) {
    return x.map(function (x) {
      return [
        x,
        d3.mean(sample, function (v) {
          return kernel(x - v);
        }),
      ];
    });
  };
}

// Epanechnikov kernel function
function epanechnikovKernel(scale) {
  return function (u) {
    return Math.abs((u /= scale)) <= 1 ? (0.75 * (1 - u * u)) / scale : 0;
  };
}
