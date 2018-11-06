// define SVG attributes
var width = parseInt(d3.select("#scatter").style("width"));
var height = width * (2/3);
var margin = 10;
var labels = 110;
var padding = 45;

// Create SVG 
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Transform to adjust for xText
svg.append("g").attr("class", "xText");
var xTextGroup = d3.select(".xtext");

var xTextX = (width - labels)/2 + labels
var xTextY = height - margin - padding;

xTextGroup.attr("transform", `translate (${xTextX}, ${xTextY})`);

// Build x-axis details
xTextGroup.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("% Pop. in Poverty");

xTextGroup.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Median Age")

xTextGroup.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Median Household Income")

// Build y-axis details
svg.append("g").attr("class", "yText");
var yTextGroup = d3.select(".yText");

// Adjust for yText
var yTextX = margin + padding;
var yTextY = (height + labels)/2 - labels;

yTextGroup.attr("transform", `translate(${yTextX}, ${yTextY}) rotate(-90)`);

// Build y-axis details and text
yTextGroup.append("text")
    .attr("y", -20)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");

yTextGroup.append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yTextGroup.append("text")
    .attr("y", 20)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Obese (%)");

// Create function to put it all together
var rad;
function adjustRadius(){
    if (width<= 530) {
        rad = 7;
    }
    else {
        rad = 10;
    }}
adjustRadius();

// Read in data and build function
// var file = "assets/data/data.csv"
d3.csv("assets/data/data1.csv").then(function(data){
    console.log(data)
    visualize(data);
    });

function visualize(data){
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // Declare current data values
    var curX = "poverty";
    var curY = "healthcare";

    // Tool tip info
    var toolTip = d3.tip().attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            // Build text box for tooltip
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${curY}: ${d[curY]}%</div>`;
            if (curX === "poverty") {
                xLine = `<div>${curX}: ${d[curX]}</div>`
            }
            else {
                xLine = `<div>${curX}: ${parseFloat(d[curX]).toLocaleString("en")}</div>`;
            }

            return stateLine + xLine + yLine
        });

    svg.call(toolTip);

    // create function to update axis when option is clicked
    function updateLabel(axis, chosenData) {
        // switch active to inactive
        d3.selectAll(".atext")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);

        // make the clicked text active
        chosenData.classed("inactive", false).classed("active", true);
    }

    // Build functions to gather max and min values for scaling
    function xMinMax() {
        xMin = d3.min(data, function(d) {
            return parseFloat(d[curX]) * .85;
        });
        xMax = d3.max(data, function(d){
            return parseFloat(d[curX]) * 1.2;
        });
    }

    function yMinMax() {
        xMin = d3.min(data, function(d) {
            return parseFloat(d[curY]) * .85;
        });
        xMax = d3.max(data, function(d){
            return parseFloat(d[curY]) * 1.2;
        });
    }

    xMinMax();
    yMinMax();

    var xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labels, width - margin])
    
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labels, margin])

    // create scaled axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // calculate tick counts
    function tickCount(){
        if (width <= 530){
            xAxis.ticks(5)
            yAxis.ticks(5)
        }
        else {
            xAxis.ticks(10)
            yAxis.ticks(10)
        }
    }
    tickCount();

    // append groups for the axes
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - margin - labels})`);

    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", `translate(${margin + labels},0)`);

    // append circles for all data records
    var circlesGroup = svg.selectAll("g allCircles").data(data)
        .enter();

    circlesGroup.append("circle")
        .attr("cx", function(d){
            // use xScale to compute the pixels
            return xScale(d[curX]);
        })
        .attr("cy", function(d){
            return yScale(d[curY]);
        })
        .attr("r", rad)
        .attr("class", function(d){
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d){
            toolTip.show(d, this);
            // highlight circle border for easier visualization
            d3.select(this).style("stroke", "white");
        })
        .on("mouseout", function(d){
            toolTip.hide(d);
            // remove highlighting
            d3.select(this).style("stroke", "pink")
        });

        // Apply the text to each circle (dx and dy are locations)
        circlesGroup.append("text")
            .attr("font-size", rad)
            .attr("class", "stateText")
            .attr("dx", function(d){
                return xScale(d[curX]);
            })
            .attr("dy", function(d){
                // push text to center by 1/3
                return yScale(d[curY]) + rad/3;
            })
            .text(function(d){
                return d.abbr;
            })
            .on("mouseover", function(d){
                toolTip.show(d);
                d3.select("." + d.abbr).style("stroke", "white");
            })
            .on("mouseout", function(d){
                toolTip.hide(d);
                d3.select("." + d.abbr).style("stroke", "pink");
            });

        // make interactive on click
        d3.selectAll(".aText")
            .on("click", function(){
                var self = d3.select(this)

                // select inactive
                if (self.classed("inactive")){
                    // obtain name and axis saved in the label
                    var axis = self.attr("data-axis")
                    var name = self.attr("data-name")

                    if (axis === "x"){
                        curX = name;

                        // updat min and max for domain for x
                        xMinMax();
                        xScale.domain([xMin, xMax]);

                        svg.select(".xaxis")
                            .transition().duration(800)
                            .call(xAxis);
                        // update location of the circles
                        d3.selectAll("circle").each(function(){
                            d3.select(this)
                                .transition().duration(800)
                                .attr("cx", function(d){
                                    return xScale(d[curX])
                                });
                        });

                        d3.selectAll(".stateText").each(function(){
                            d3.select(this)
                                .transition().duration(800)
                                .attr("dx", function(d) {
                                    return xScale(d[curX])
                                });
                        });

                        // update
                        updateLabel(axis, self);
                    }

                    // Update for Y axis selection
                    else {
                        curY = name;

                        // update min and max for Y
                        yMinMax();
                        yScale.domain([yMin, yMax]);

                        svg.select(".yaxis")
                            .transition().duration(800)
                            .call(yAxis)

                        // Update location of circles

                        d3.selectAll("circle").each(function() {
                            d3.select(this)
                                .transition().duration(800)
                                .attr("cy", function(d){
                                return yScale(d[curY])
                                });
                        });

                        d3.selectAll("circle").each(function() {
                            d3.select(this)
                            .transition().duration(800)
                            .attr("dy", function(d){
                                return yScale(d[curY]) + rad/3;
                            });
                        });

                        updateLabel(axis, self);
                    }
                }
            });

};