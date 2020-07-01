// The code for the chart is wrapped inside a function
// that automatically resizes the chart
console.log("This is working!!!");
function makeResponsive() {

// If the SVG area isn't empty when the browser loads, remove it
// and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    // Clear SVG 
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width
    // and height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    // Define SVG area dimensions
    var svgWidth = 960;
    var svgHeight = 600;

    // Define the chart's margins as an object
    var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
    };
//Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create an SVG wrapper, append an SVG group that will 
//hold our chart, and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Setting Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateInfo, chosenXAxis) {
    // create scales
    var xLinearScale = d3
    .scaleLinear()
    
    .domain([
        d3.min(stateInfo, d => d[chosenXAxis]) * 0.8,
        d3.max(stateInfo, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  };

// function used for updating y-scale var upon click on axis label
function yScale(stateInfo, chosenYAxis) {
    // create scales
    var yLinearScale = d3
    .scaleLinear()
    .domain([
        d3.min(stateInfo, d => d[chosenYAxis]) * 0.8,
        d3.max(stateInfo, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  };

// Function used for updating xAxis var upon click on axis label
function updateXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis
        .transition()
        .duration(1000)
        .call(bottomAxis);
  
    return xAxis;
  };


// Function used for updating yAxis var upon click on axis label
  function updateYAxes (newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale)
    yAxis
        .transition()
        .duration(1500)
        .call(leftAxis);

    return yAxis;
  };

// function used for updating circles group with a transition to
// new circles
function renderCircles (
    circlesGroup, 
    newXScale, 
    chosenXaxis,
    newYScale, 
    chosenYaxis
    ) {
    circlesGroup
    .transition()
    .duration(1500)
    .attr('cx', d => newXScale(d[xValue]))
    .attr('cy', d => newYScale(d[yValue]))
    return circlesGroup;
  };
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "smokes") {
      label = "Smokes:";
    }
    else {
      label = "Age:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(stateInfo) {
      toolTip.show(stateInfo);
    })
    // onmouseout event
    .on("mouseout", function(stateInfo, index) {
        toolTip.hide(stateInfo);
      });
  
    return circlesGroup;
}

// Import Data from data.csv
d3.csv("assets/data/data.csv").then(function(stateInfo) {
//    if (err) throw err;
    console.log(stateInfo);
    

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateInfo.forEach(function(data) {
    data.smokes = +data.smokes;
    data.age = +data.age;
    });
    console.log(stateInfo);

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateInfo, chosenXAxis);

    // Step 2: Create scale functions
    // ==============================
    // var xLinearScale = d3.scaleLinear()
    //   .domain([0, d3.max(stateInfo, d => d.smokes)])
    //   .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(stateInfo, d => d.age)])
      .range([height, 0]);


     // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    // append x axis
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

// append y axis
    chartGroup.append("g")
    .call(leftAxis);

//     chartGroup.append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(bottomAxis);

//   chartGroup.append("g")
//     .call(leftAxis);


     // Step 5: Create Circles
    
    var circlesGroup = chartGroup.selectAll("circle")
    .data(stateInfo)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.xAxis))
    .attr("cy", d => yLinearScale(d.age))
    .attr("r", "15")
    .attr("fill", "pink")
    .attr("opacity", ".5");

    


    // Initialize tool tip
    
    var toolTip = d3.tip()
      .attr("class", "tooltip d3-tip")
      .offset([90, 90])
      .html(function(d) {
        return (`${d.abbr}<br>Smokes: ${d.smokes}<br>Age: ${d.age}`);
      });

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var smokers = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokers)");

    var smokerAge = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age of smokers");

    // append y axis
  chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Smokers vs Age");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

         console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateInfo, chosenXAxis);

        // updates x axis with transition
        updateXAxis = renderAxes(xLinearScale, updatexXAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, XAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(XAxis, circlesGroup);

        // changes classes to change bold text
        if (xAxis === "smokes") {
          smokers
            .classed("active", true)
            .classed("inactive", false);
          age
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          XLabel
            .classed("active", false)
            .classed("inactive", true);
          YLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
}; 

//     // Step 7: Create tooltip in the chart
//     // ==============================
//     chartGroup.call(toolTip);

//     // Step 8: Create event listeners to display and hide the tooltip
//     // ==============================
//     circlesGroup.on("click", function(stateInfo) {
//         toolTip.show(stateInfo, this);
//       })
//         // on mouseout event
//         .on("mouseout", function(stateInfo, index) {
//           toolTip.hide(stateInfo);
//         });


//          // Create axes labels
//          chartGroup.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", 0 - margin.left + 40)
//       .attr("x", 0 - (height / 2))
//       .attr("dy", "1em")
//       .attr("class", "axisText")
//       .text("Number of Cigarettes");

//       chartGroup.append("text")
//       .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
//       .attr("class", "axisText")
//       .text("Age");
//     }).catch(function(error) {
//     console.log(error);
//   });

//When the browser loads, makeResponsive() is called.
makeResponsive();

// // When the browser window is resized, responsify() is called.
d3.select(window).on("resize", makeResponsive)
// };
