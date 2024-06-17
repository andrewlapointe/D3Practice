// Dimensions and margins of the graph, svg canvas
const margin = { top: 10, right: 40, bottom: 30, left: 30 };
const graphWidth = 750 - margin.left - margin.right;
const graphHeight = 700 - margin.top - margin.bottom;
const canvasHeight = graphHeight + margin.top + margin.bottom;
const canvasWidth = graphWidth + margin.left + margin.right;

const Y_AXIS_LABEL = "Log2(FC)";
const X_AXIS_LABEL = "Compounds";
const HSP_HOSTNAME = "https://salivaryproteome.org";
const GRAPH_TITLE = "Fold Change Analysis";
const DATA_FILE_PATH =
    "/practice-mzheng/vanilla-d3/data-sets/fold-change/fold_change.csv";

/**
 * Parse the input csv file for the graph data points
 * @returns Object array containing plot coordinates
 */
const parseData = async () => {
    const data = await d3
        .csv(DATA_FILE_PATH, (data) => {
            // NOTE: + used to convert string data to number
            return {
                fold_change: +data["Fold Change"],
                log2_fc: +data["log2(FC)"],
                protein: data[""],
            };
        })
        .catch((err) => {
            console.error("> Data file parsing error!", err);
        });

    return data;
};

/**
 * Setup the main SVG canvas for the graph to go into
 */
const setUpCanvas = () => {
    // append the svg object to the body of the page
    return d3
        .select("#fold-graph")
        .append("svg")
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
};

/**
 * Creates and returns D3 scale based on parameters passed in
 * @param {Object[]} data Array containing all graph data points
 * @param {String} axisAttr Graph data point depending on your X or Y axis
 * @param {Number[]} range Range of pixels corresponding to your X or Y axis
 * @returns D3 Linear scale to help with converting data to svg pixel coordinates
 */
const createScale = (data, axisAttr, range) => {
    const minValue = d3.min(data, (d) => d[axisAttr]);
    let maxValue = d3.max(data, (d) => d[axisAttr]);

    if (axisAttr === "fold_change") maxValue = "3";

    console.log(
        `> Axis Attr: [${axisAttr}], Min Value: [${minValue}], Max Value: [${maxValue}]`
    );

    return d3
        .scaleLinear()
        .domain([minValue, maxValue]) // Domain of graph data xAxis ([minVal, MaxVal])
        .range(range) // This is the corresponding value I want in Pixel
        .nice(); // Make axis end on a clean number
};

/**
 * Add the X and Y axis to the graph & their labels
 * @param {svg} svg SVG of the graph
 * @param {function} xScale Convert X data to graph X coordinate for graph
 * @param {function} yScale Convert Y data to graph Y coordinate for graph
 */
const addAxis = (svg, xScale, yScale) => {
    //  X Axis
    svg.append("g")
        .attr("transform", `translate(0,${graphHeight / 2})`)
        .call(d3.axisBottom(xScale));

    // Left Y Axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Right Y Axis
    // NOTE: axisRight moves label to right side
    svg.append("g")
        .attr("transform", `translate(${graphWidth},0)`)
        .call(d3.axisRight(yScale));

    // X Axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", graphWidth / 2)
        .attr("y", graphHeight + margin.bottom - 10)
        .text(X_AXIS_LABEL);

    // Y Axis Label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -graphHeight / 2)
        .attr("y", graphWidth + 40)
        .text(Y_AXIS_LABEL);

    // Add graph title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", graphWidth / 2)
        .attr("y", margin.top + 10)
        .text(GRAPH_TITLE);
};

/**
 * Opens the associated proteins detail page on HSP site in same tab
 * @param {string} protein Id of a protein
 */
const openProteinDetails = (protein) => {
    window.open(
        `${HSP_HOSTNAME}/protein/${protein}`,
        "_self" // Open page in same tab
    );
};

/**
 * Add tooltip div container w/ applied style
 */
const addToolTips = () => {
    return d3
        .select("#fold-graph")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");
};

// Add ability to zoom in & out of the graph
const addZoom = () => {
    const handleZoom = (event) => {
        d3.select("#fold-graph g").attr("transform", event.transform);
    };

    const zoom = d3.zoom().on("zoom", handleZoom);

    d3.select("#fold-graph").call(zoom);
};

const createGraph = async () => {
    const graphData = await parseData();
    console.log("> Data", graphData);

    const svg = setUpCanvas();
    const xScale = createScale(graphData, "fold_change", [0, graphWidth]);
    const yScale = createScale(graphData, "log2_fc", [graphHeight, 0]);

    // Create X, Y axis & adds graph title
    addAxis(svg, xScale, yScale);

    // Add zoom to graph
    addZoom();

    const tooltips = addToolTips();

    /**
     * Show tooltip on mouse enter
     * @param {Object} event D3 event
     * @param {Object} d Point data of point hovered over
     */
    const mouseEnter = (event, d) => {
        const { protein, fold_change, log2_fc } = d;

        const toolTipContent =
            `<b>Protein:</b> ${protein}<br/>` +
            `<b>Fold Change:</b> ${fold_change}<br/>` +
            `<b>Log2_fc:</b> ${log2_fc}<br/>`;

        tooltips
            .style("opacity", 1)
            .html(toolTipContent)
            // Position tooltip location relative to point
            .style("left", event.pageX - 5 + "px")
            .style("top", event.pageY - 90 + "px");
    };

    /**
     * Hide tooltip on mouse leave
     */
    const mouseLeave = () => {
        tooltips.transition().duration(200).style("opacity", 0);
    };

    // Plot coordinates onto graph
    svg.append("g")
        .selectAll(".point")
        .data(graphData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.fold_change))
        .attr("cy", (d) => yScale(d.log2_fc))
        .attr("r", 2.5)
        .style("fill", "red")
        // Show or hide tooltip on hover/leave for each point
        .on("mouseenter", mouseEnter)
        .on("mouseleave", mouseLeave)
        // Add proteins detail page link to each point
        .on("click", (event, d) => openProteinDetails(d.protein));
};

createGraph();
