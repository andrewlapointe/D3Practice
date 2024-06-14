body {
    font-family: "Arial", sans-serif;
}

#venn {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

.venn-circle {
    stroke: #000;
    stroke-width: 2px;
    fill-opacity: 0.5;
}

.venn-label {
    font-size: 20px; /* Default size for all labels */
    font-weight: bold;
}

.venn-label-A {
    font-size: 24px; /* Increase size for set A label */
}

.venn-label-B {
    font-size: 24px; /* Increase size for set B label */
}

.tooltip {
    position: absolute;
    background-color: #f9f9f9;
    padding: 10px;
    border: 1px solid #d3d3d3;
    border-radius: 4px;
    pointer-events: none;
    display: none;
}
