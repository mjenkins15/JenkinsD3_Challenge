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
    var svgWidth = window.innerWidth *.50;
    var svgHeight = window.innerHeight * .50;
    // Define SVG area dimensions
    //var svgWidth = 960;
    //var svgHeight = 600;
    // Define the chart's margins as an object
  
    var margin = {
    top: 100,
    right: 100,
    bottom: 100,
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
    .attr("height", svgHeight)
    .attr("width", svgWidth)

// Append a group to the SVG area and shift ('translate') it to the right 
//and down to adhere to the margins set in the "margin" object.
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
  var leftAxis = d3.axisLeft(newYScale);
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
  chosenXAxis,
  newYScale, 
  chosenYAxis
  ) {
  circlesGroup
    .transition()
    .duration(1500)
    .attr('cx', d => newXScale(d[chosenXAxis]))
    .attr('cy', d => newYScale(d[chosenYAxis]))
    return circlesGroup;
};

 // update text transition
 function renderText (
  textGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  textGroup
    .transition()
    .duration(1500)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]))
    .attr('text-anchor', 'middle') 
  return textGroup
};

// Function used for updating circles group with new tooltip
function updateToolTip (chosenXAxis, chosenYAxis, circlesGroup, textGroup) {
  if (chosenXAxis === 'poverty') {
    var xLabel = 'Poverty (%)'
  } else if (chosenXAxis === 'age') {
    var xLabel = 'Age (median)'
  } else {
    var xLabel = 'Income (median)'
  }
  if (chosenYAxis === 'healthcare') {
    var yLabel = 'Healthcare (%)'
  } else if (chosenYAxis === 'obesity') {
    var yLabel = 'Obesity (%)'
  } else {
    var yLabel = 'Smokes (%)'
  }
  //Create tooltips
    var toolTip = d3.tip()
        .attr('class', 'tooltip d3-tip')
        .offset([90, 90])
        .html(function (d) {
          return `<strong>${d.abbr}</strong><br>${xLabel}${d[chosenXAxis]}<br>${yLabel}${d[chosenYAxis]}`
});
  //Circles tooltips with event listeners
    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(stateInfo) {
      toolTip.show(stateInfo, this)
    })
    // Onmouseout event
    .on("mouseout", function(stateInfo) {
        toolTip.hide(stateInfo);
      });
  // Text tooltips with event listeners
    textGroup.call(toolTip)
    textGroup.on('mouseover', function(stateInfo) {
      toolTip.show(stateInfo, this)
      })
    // Onmouse event
    .on('mouseout', function(stateInfo) {
      toolTip.hide(stateInfo)
    })
    return circlesGroup;
};
// Import Data from data.csv
d3.csv("assets/data/data.csv").then(function(stateInfo) {
  //    if (err) throw err;
    //console.log(stateInfo);
    // Step 1: Parse Data/Cast as numbers
  stateInfo.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  }); 
    console.log(stateInfo);

    //  Step 2: Create scale functions
    // ==============================
    // var xLinearScale = d3.scaleLinear()
    //   .domain([0, d3.max(stateInfo, d => d.smokes)])
    //   .range([0, width]);
    // xLinearScale and yLinearScale function above csv import
    var xLinearScale = xScale(stateInfo, chosenXAxis);
    var yLinearScale = yScale(stateInfo, chosenYAxis);
    
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(stateInfo, d => d.chosenYAxis)])
      .range([height, 0]);
      
    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    // Append x axis
    var xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup
    .append('g')
    .classed('y-axis', true)
    .call(leftAxis)

   // Step 5: Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(stateInfo)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.chosenXAxis))
    .attr("cy", d => yLinearScale(d.chosenYaxis))
    .attr("r", "20")
    .attr("fill", "pink")
    .attr("opacity", ".75");

    // Text appended to circles
    var textGroup = chartGroup
    .selectAll()
    .data(stateInfo)
    .enter()
    .append('text')
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis] * 0.90))
    .text(d => d.abbr)
    .attr('class', 'stateText')
    .attr('font-size', '12px')
    .attr('text-anchor', 'middle')
    .attr('fill', 'grey')

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var poverty = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty(%)");

    var age = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(median)");

    var income = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income(median)");

    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${-20}, ${height / 2})`);

    // Append y-axis
     var healthcare = yLabelsGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -20)
      .attr('x', 0)
      .attr('value', 'healthcare')
      .attr('dy', '1em')
      .classed('axis-text', true)
      .classed('active', true)
      .text('Lacks Healthcare (%)');
    
      var smokes = yLabelsGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', 0)
      .attr('value', 'smokes')
      .attr('dy', '1em')
      .classed('axis-text', true)
      .classed('inactive', true)
      .text('Smokers (%)');

      var obesity = yLabelsGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', 0)
      .attr('value', 'obesity')
      .attr('dy', '1em')
      .classed('axis-text', true)
      .classed('inactive', true)
      .text('Obesity (%)');

     // updateToolTip function above csv import
    var circlesGroup = updateToolTip(
      chosenXAxis,
      chosenYAxis,
      circlesGroup,
      textGroup
    );
  
  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value")

      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;
    console.log(chosenXAxis)
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateInfo, value);
        // updates x axis with transition
        xAxis = updateXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis,
        );

        textGroup = renderText(
          textGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );
        // updates tooltips with new info
        circlesGroup = updateToolTip(
          chosenXAxis,
          chosenYAxis,
          circlesGroup,
          textGroup
        );
        
        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          poverty
            .classed("active", true)
            .classed("inactive", false);
          age
            .classed("active", false)
            .classed("inactive", true);
          income
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === 'age') {
          poverty
            .classed("active", false)
            .classed("inactive", true);
          age
            .classed("active", true)
            .classed("inactive", false);
          income
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          poverty
          .classed('active', false)
          .classed('inactive', true);
          age
          .classed('active', false)
          .classed('inactive', true);
          income
          .classed('active', true)
          .classed('inactive', false);
        }
      }
    });

    yLabelsGroup.selectAll('text').on('click', function () {
      var value = d3.select(this).attr('value')
      if (value !== chosenYAxis) {
        chosenYAxis = value
    console.log(chosenYAxis);

        yLinearScale = yScale(stateInfo, chosenYAxis)
        yAxis = updateYAxes(yLinearScale, yAxis)
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          chosenXAxis,
          yLinearScale,
          chosenYAxis
        );

        // // Updates Text with New Values
        // textGroup = renderText(
        //   textGroup,
        //   xLinearScale,
        //   chosenXAxis,
        //   yLinearScale,
        //   chosenYAxis
        // );

        // // Updates Tooltips with New Information
        // circlesGroup = updateToolTip(
        //   chosenXAxis,
        //   chosenYAxis,
        //   circlesGroup,
        //   textGroup
        // );
        
        if (chosenYAxis === 'healthcare') {
          healthcare
            .classed('active', true)
            .classed('inactive', false);
          smokes
            .classed('active', false)
            .classed('inactive', true);
          obesity
            .classed('active', false)
            .classed('inactive', true);
        } 
        else if (chosenYAxis === 'smokes') {
          healthcare
            .classed('active', false)
            .classed('inactive', true);
          smokes
            .classed('active', true)
            .classed('inactive', false);
          obesity
            .classed('active', false)
            .classed('inactive', true);
        }
        else {
          healthcare
            .classed('active', false)
            .classed('inactive', true);
          smokes
            .classed('active', false)
            .classed('inactive', true);
          obesity
            .classed('active', true)
            .classed('inactive', false);
        }
      }
    })
  })
};
makeResponsive();
// When Browser Window is Resized, makeResponsive() is Called
d3.select(window).on('resize', makeResponsive);






// }).catch(function(error) {
//   console.log(error);
// });
// };
// makeResponsive();

// makeResponsive()
// // When Browser Window is Resized, makeResponsive() is Called
// d3.select(window).on('resize', makeResponsive)