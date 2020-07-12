// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 100,
  bottom: 120,
  left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenYAxis = "healthcare";
var chosenXAxis = "income";

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
                d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height,0]);
    return yLinearScale;
}

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating yAxis var upon click on axis label
function renderyAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(500)
        .call(leftAxis);
    return yAxis;
  }

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(500)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

function renderLables(circlesLabelsGroup, newYScale, chosenYAxis, newXScale, chosenXAxis) {
    circlesLabelsGroup.transition()
      .duration(500)
      .attr("dy", d => newYScale(d[chosenYAxis]))
      .attr("dx", d => newXScale(d[chosenXAxis]));
    return circlesLabelsGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, chosenXAxis, circlesGroup) {

    var yLabel;

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks HealthCare %:";
    }
    else if (chosenYAxis === "somkes"){
        yLabel = "Smokes %:";
    }
    else if (chosenYAxis === "obesity"){
        yLabel = "Obese %:"
    }

    var xLabel;

    if (chosenXAxis === "income") {
        xLabel = "Household Income Median:";
    }
    else if (chosenXAxis === "age"){
        xLabel = "Age Median:";
    }
    else if (chosenXAxis === "poverty"){
        xLabel = "In Poverty %:"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([-60, 0])
        .html(function(d) {
            return (`${d.state}<br>${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
        });

        circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(usData) {

    // parse data
    usData.forEach (function(data){
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var yLinearScale = yScale(usData, chosenYAxis);
    var xLinearScale = xScale(usData, chosenXAxis);
    

    // Create initial axis functions
    var leftAxis = d3.axisLeft(yLinearScale);
    var bottomAxis = d3.axisBottom(xLinearScale);
    
    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${width})`)
        .call(bottomAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(usData)
        .enter()
        .append("circle")
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("r", "10")
        .attr("fill", "teal")
        .attr("opacity", ".7");

    // append labels to circles
    var circleLabelsGroup = chartGroup.selectAll(".circleLabel")
        .data(usData)
        .enter()
        .append("text")
        .classed(".circleLabel",true)
        .text(d=>d.abbr)
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("alignment-baseline", "central")
        .classed("stateText", true)
        .attr("font-size", "10px");

    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    var yLabelsGroup = chartGroup.append("g")

    var healthcareLabel = yLabelsGroup.append("text")  
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "active")
        .attr("value", "healthcare")
        .text("Lacks HealthCare(%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "inactive")
        .attr("value", "smokes")
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "inactive")
        .attr("value", "obesity")
        .text("Obese (%)");

    var xLabelsGroup = chartGroup.append("g")
    
    var incomeLabel = xLabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
        .attr("class", "active")
        .attr("value", "income")
        .text("Household Income (Median)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 40})`)
        .attr("class", "inactive")
        .text("Age (Median)")
        .attr("value", "age");;

    var povertyLabel = xLabelsGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 60})`)
        .attr("class", "inactive")
        .attr("value", "poverty")
        .text("In Poverty (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenYAxis, chosenXAxis, circlesGroup);

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function(){

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis){

                // replaces chosenYAxis with value
                chosenYAxis = value;
                
                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(usData, chosenYAxis);

                // updates x axis with transition
                yAxis = renderyAxes(yLinearScale, yAxis);
                
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, xLinearScale, chosenXAxis);

                // updates labels 
                circleLabelsGroup = renderLables(circleLabelsGroup, yLinearScale, chosenYAxis, xLinearScale, chosenXAxis);
            
                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function(){

            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis){

                // replaces chosenXAxis with value
                chosenXAxis = value;
                
                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(usData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderxAxes(xLinearScale, xAxis);
                
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, xLinearScale, chosenXAxis);

                // updates labels 
                circleLabelsGroup = renderLables(circleLabelsGroup, yLinearScale, chosenYAxis, xLinearScale, chosenXAxis);
            
                // changes classes to change bold text
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});