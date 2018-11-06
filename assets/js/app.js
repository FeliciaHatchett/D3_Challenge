// // @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Step 1: Parse Data/Cast as numbers
// ==============================
var file = "assets/data/data1.csv"
d3.csv(file).then(function(data){
    console.log(data);
    data.forEach(d => {
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
        d.noHealthInsurance = +d.noHealthInsurance;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        // d.povertyMoe = +d.povertyMoe;
        // d.incomeMoe = +d.incomeMoe;
        // d.ageMoe = +d.ageMoe;
    });

    // Step 2: Create scale functions
    // ============================== 
    var xLinearScale = d3.scaleLinear()
    .domain([8, d3.max(data, d => d.poverty)])
    .range([0, width]);

    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.noHealthInsurance)])
    .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

      // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    chartGroup.append("g")
    .call(leftAxis);

       // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.noHealthInsurance))
    .attr("r", "15")
    .attr("fill", "lightBlue")
    .attr("opacity", ".75")
    .attr("stroke", "pink")
  

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.state}<br>% in Poverty: ${d.poverty}%<br>% Without Health Insurance: ${d.noHealthInsurance}`);
        });

      // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

      // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

     
    chartGroup.selectAll(".dodo")
    .data(data)
    .enter().append("text")
    .attr("class", "dodo")
    .attr("x", function(d) { return xLinearScale(d.poverty); })
    .attr("y", function(d) { return yLinearScale(d.noHealthInsurance); })
    .text(function(d) { return d.abbr;})
    .attr("dy", ".5em")
    .attr("dx", "-.5em")
    .attr("fill", "darkGrey")
    .attr("text-anchor", "center")
    .attr("font-size", 9)
    ;

      // Create axes labels
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2) - 40)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .text("Lacks Healthcare (%)");

    chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
    .attr("class", "axisText")
    .text("In Poverty (%)");

})
