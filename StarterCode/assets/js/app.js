// Chart Parameters
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

// Append a div classed chart to the scatter element
var chart = d3.select("#scatter").append("div").classed("chart", true);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = chart
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// X and Y axis
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) *0.8,
      d3.max(censusData, d => d[chosenXAxis]) *1.20])
    .range([0,width]);

   return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenYAxis])*0.8,
      d3.max(censusData, d => d[chosenYAxis])*1.2])
    .range([height, 0]);

   return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
  
  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  //function for updating State labels
  function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr('x', d => newXScale(d[chosenXAxis]))
      .attr('y', d => newYScale(d[chosenYAxis]));

    return textGroup
  }

  //function to stylize x-axis values for tooltips
  function styleX(value, chosenXAxis) {
    if (chosenXAxis === "age") {
      return `${value}`;
    }
    else if (chosenXAxis === "poverty") {
      return `${value}%`;
    }
    else {
      return `$${value}`;
    }
  }
  
  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
    if (chosenXAxis === "age") {
      var xLabel = "Age (median):";
    }

    else if (chosenXAxis === "poverty") {
      var xLabel = "Poverty:";
    }

    else {
      var xLabel = "Income ";
    };

    if (chosenYAxis === "smokes") {
      var yLabel = "Smokers:";
    }

    else if(chosenYAxis === "obesity") {
      var yLabel = "Obesity";
    }

    else {
      var yLabel = "Lacks Healthcare";
    }
    
    // Create tooltip
    var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(tip);
  
    circlesGroup.on("mouseover", tip.show)
    
  //     // onmouseout event
      .on("mouseout", tip.hide);
      
  
      return circlesGroup;
  }
  
  
  // Retrieve data from the CSV file and execute everything below
  d3.csv("./assets/data/data.csv").then(function(censusData, err) {
    // if (err) throw err;
  
    // parse data
    censusData.forEach(function(data) {
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.poverty = +data.poverty;
      data.income = +data.income;

    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);
    var yLinearScale = yScale(censusData, chosenYAxis);


 
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(censusData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 14)
      .attr("opacity", ".5");

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(censusData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[chosenXAxis]))
      .attr('y', d => yLinearScale(d[chosenYAxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});
  
    // Create group for  x- axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var ageLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 10)
      .attr("value", "age")
      .classed("active", true)
      .text("Age (median)");
  
    var povertyLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value", "poverty")
      .classed("inactive", true)
      .text("In Poverty (%)");

    var incomeLabel = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");
  
    // Create group for y axis
    var yLabelsGroup = chartGroup.append("g")
     .attr("transform", `translate(${0 - margin.left}, ${height/2})`);

    var smokesLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - -10)
      .attr("x", 0)
      .attr("value", "smokes")
      .classed("active", true)
      .text("Smokers (%)");
    
    var obesityLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - - 30)
      .attr("x", 0)
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese (%)");

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - - 50)
      .attr("x", 0)
      .attr("value", "healthcare")
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var xvalue = d3.select(this).attr("value");
        if (xvalue !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = xvalue;
  
          // updates x scale for new data
          xLinearScale = xScale(censusData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
  
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
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
          else {
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("active", true);
          }
        }
      });
      //y axis lables event listener
      yLabelsGroup.selectAll('text')
        .on('click', function() {

          // get value of selection
          var value = d3.select(this).attr('value');

          if(value !=chosenYAxis) {

            //replace chosenY with value
            chosenYAxis = value;

            //update Y scale
            yLinearScale = yScale(censusData, chosenYAxis);

            //update Y axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            //Udate CIRCLES with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update TEXT with new Y values
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            //update tooltips
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
           

            //Change of the classes changes text
            if (chosenYAxis === 'smokes') {
              smokesLabel
              .classed('active', true)
              .classed('inactive', false);
              obesityLabel
              .classed('active', false)
              .classed('inactive', true);
              healthcareLabel
              .classed('active', false)
              .classed('inactive', true);
            }
            else if (chosenYAxis === 'obesity') {
              obesityLabel
              .classed('active', true)
              .classed('inactive', false);
              smokesLabel
              .classed('active', false)
              .classed('inactive', true);
              healthcareLabel
              .classed('active', false)
              .classed('inactive', true);
            }
            else {
              healthcareLabel
              .classed('active', true)
              .classed('inactive', false);
              obesityLabel
              .classed('active', false)
              .classed('inactive', true);
              smokesLabel
              .classed('active', false)
              .classed('inactive', true);
            }
          }
        });
  });
