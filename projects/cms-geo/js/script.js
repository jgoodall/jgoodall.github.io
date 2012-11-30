
var levels = {national:"National", state:"State", county:"County"};
if ( _.isUndefined(defaultLevel) )
    var defaultLevel = levels.state;

var xIndicatorScale,
    yIndicatorScale,
    colorIndicatorScale;

// whether alphabetic sorting is active (and hence numeric is not)
var alphaSort = false;

var indicatorBarChart,
    indicatorBars, // g container
    indicatorRects, // individual rectangles
    mean,   // mean value for a given year
    avgYears,  // calculated array of {Year: <year>, Avg: <value>}
    minYear,
    maxYear,
    minVal,
    maxVal,
    indicatorMeanLine,
    indicatorMeanLabel,
    yearHistogramTitle,
    legendBoxes;



// CONSTANTS //
// total width is w (popupWidth are subtracted)
var barsHeight = 540; // height of container for indicator bar chart

var mapBoundaries,
    stateMapData = "./data/us-states.json",
    countyMapData = "./data/us-counties.json";

// options for spin.js
var spinnerOpts = {
  lines: 8, // The number of lines to draw
  length: 8, // The length of each line
  width: 3, // The line thickness
  radius: 8, // The radius of the inner circle
  color: '#333', // #rgb or #rrggbb
  speed: 1.0, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: true // Whether to render a shadow
};

// color scales
var redBlue = ["rgb(103, 0, 31)", "rgb( 178, 24, 43)", "rgb( 214, 96, 77)", "rgb( 244, 165, 130)", "rgb( 253, 219, 199)", "rgb( 209, 229, 240)", "rgb( 146, 197, 222)", "rgb( 67, 147, 195)", "rgb( 33, 102, 172)", "rgb( 5, 48, 97)"];
var brownBlueGreen = ["rgb(84, 48, 5)", "rgb( 140, 81, 10)", "rgb( 191, 129, 45)", "rgb( 223, 129, 125)", "rgb( 246, 232, 195)", "rgb( 199, 234, 229)", "rgb( 128, 205, 193)", "rgb( 53, 151, 143)", "rgb( 1, 102, 94)", "rgb( 0, 60, 48)"];
var purpleGreen = ["rgb(64, 0, 75)", "rgb( 118, 42, 131)", "rgb( 153, 112, 171)", "rgb( 194, 165, 207)", "rgb( 231, 212, 232)", "rgb( 217, 240, 211)", "rgb( 166, 219, 160)", "rgb( 90, 174, 97)", "rgb( 27, 120, 55)", "rgb( 0, 68, 27)"];
var redYellowBlue = ["rgb(165, 0, 38)", "rgb( 215, 48, 39)", "rgb( 244, 109, 67)", "rgb( 253, 174, 97)", "rgb( 254, 224, 144)", "rgb( 224, 243, 248)", "rgb( 171, 217, 233)", "rgb( 116, 173, 209)", "rgb( 69, 117, 180)", "rgb( 49, 54, 149)"];
var purpleOrange = ["rgb(127, 59, 8)", "rgb( 179, 88, 6)", "rgb( 224, 130, 20)", "rgb( 253, 184, 99)", "rgb( 254, 224, 182)", "rgb( 216, 218, 235)", "rgb( 178, 171, 210)", "rgb( 128, 115, 172)", "rgb( 84, 39, 136)", "rgb( 45, 0, 75)"];
var palettes = [redBlue, brownBlueGreen, purpleGreen, redYellowBlue, purpleOrange],
    currentPaletteIndex = 0,
    currentPalette = palettes[currentPaletteIndex];


// data variables
var name = "Locale",
    level = "Locale Level",
    stateFips = "Locale State FIPS Code",
    countyFips = "Locale County FIPS Code",
    yr = "Year",
    val = "Numeric Value",
    avg = "Avg";

// UTILITY FUNCTIONS //

// number formatter for indicator values
var numFormatter = d3.format(".1f");

// set a highlight color based on the current palette
var highlightColor = function() {return currentPaletteIndex === 0 || currentPaletteIndex === 3 ? "darkolivegreen" : "steelblue";};


// return data filtering for specified year only
var localeData = {
    d : null,
    d4yr : null,
    locd4yr : null,
    currentYear : null,
    currentLevel : null,

    getAllData : function() {
        return d;
    },

    // data for a given year, default to current if none given
    getAllDataForYear : function(theYear) {
        if ( _.isUndefined(theYear) )
            return d4yr;
        else
            return _.select(d, function(element, index) { return element[yr] === theYear; });
    },

    getLocaleDataForYear : function(theYear) {
        if ( _.isUndefined(theYear) )
            return locd4yr;
        else
            _.select(d, function(element, index) { return element[level] === currentLevel && element[yr] === theYear; });
    },

    setData : function(theData, theYear, theLevel) {
        d = theData;
        currentYear = theYear;
        currentLevel = theLevel;
        d4yr = _.select(d, function(element, index) { return element[yr] === currentYear; });
        locd4yr = _.select(d, function(element, index) { return element[level] === currentLevel && element[yr] === currentYear; });
    },

    getCurrentYear : function() {
        return currentYear;
    },

    getCurrentLevel : function() {
        return currentLevel;
    },

    setCurrentYear : function(theYear) {
        currentYear = theYear;
        d4yr = _.select(d, function(element, index) { return element[yr] === currentYear; });
    },

    setCurrentLevel : function(theLevel) {
        currentLevel = theLevel;
        locd4yr = _.select(d, function(element, index) { return element[level] === currentLevel && element[yr] === currentYear; });
    },

    // return the fips code for the current level
    getFipsCode : function() {
        if ( localeData.getCurrentLevel() === "State" )
            return stateFips;
        else if ( localeData.getCurrentLevel() === "County" )
            return countyFips;
    }

};

// MAIN EXECUTION //

// start spinners for each view, stop at end of data load
var barSpinner = new Spinner(spinnerOpts).spin(document.getElementById('indicatorBarChart'));
var mapSpinner = new Spinner(spinnerOpts).spin(document.getElementById('indicatorMap'));

// load requested data set, which is set in html file
loadData(indicatorData);


// FUNCTIONS //

// load the data asynchronously and set up static values
function loadData(file) {
    d3.json(file, function(json) {

        // min/max across all years
        // todo: these should be per year probably
        maxVal = d3.max(json, function(d) { return d[val]; });
        minVal = d3.min(json, function(d) { return d[val]; });

        minYear = d3.min( json, function(d) { return d[yr]; } ),
        maxYear = d3.max( json, function(d) { return d[yr]; } );

        // set up data model
        localeData.setData(json, maxYear, defaultLevel);

        // set up year:max val object [{yr:max}, ..]
        avgYears = [];
        var uniqYears = d3.range(minYear, maxYear+1);
        for ( var i = 0 ; i < uniqYears.length ; i++ ) {
           var y = uniqYears[i];
           var dataYears = localeData.getAllDataForYear(y);
           var a = dataYears.length > 0 ? d3.sum(dataYears, function(d) { return d[val]; } ) / dataYears.length : 0;
           avgYears.push( {Year : y, Avg : a } );
        }

        initYearData();
        initVis();

        barSpinner.stop();
        mapSpinner.stop();
    });
}

// set up the data for an individual year, called for each year change
function initYearData() {


    // sort by value by default
    localeData.getLocaleDataForYear().sort(function(a,b) { return b[val] - a[val]; });
    alphaSort = false;
    d3.selectAll("#alphabetic").classed("active", alphaSort);
    d3.selectAll("#numeric").classed("active", !alphaSort);

    mean = _.select(avgYears, function(element, index) {
                return element[yr] === localeData.getCurrentYear(); })[0][avg];

//    mean = _.select(localeData.getAllData(), function(element, index) {
//                return element[level] === "National"; })[0][val];

    colorIndicatorScale = d3.scale.quantile()
                .domain([minVal, mean, maxVal])
                .range(currentPalette);

}

// initial set up for all visualizations, called only once
function initVis() {
    initYearHistogram();
    initIndicatorBars();
    initMap();
    initLegend(0, barsHeight);
}

// initialize bar chart for locales
function initIndicatorBars() {

    var barsWidth = 125, // size for bars (column is bar+labels)
        barsLabelWidth = 125, // to left of bars for geographic names
        barsHoverLabelWidth = 50, // to right of bars for values on hovering
        barsTopTitleHeight = 25, // top of bars for title
        barsTopAvgLabelHeight = 15, // top of bars for avg. label
        barsBottomLabelHeight = 15; // bottom of bars for ticks and value labels

    xIndicatorScale = d3.scale.linear()
            .domain([0, maxVal])
            .rangeRound([0, barsWidth]);

    indicatorBarChart = d3.select("#indicatorBarChart")
    .append("svg:svg")
        .attr("width",$("#indicatorBarChart").width())
        .attr("height",$("#indicatorBarChart").height())
    .append("svg:g")
        .attr("transform", "translate(" + barsLabelWidth + ", " + barsTopTitleHeight + ")");

    // mean line and label
    indicatorMeanLine = indicatorBarChart.append("svg:line")  // mean line
        .attr("class", "meanRule")
        .attr("y1", 0)
        .attr("y2", barsHeight)
        .attr("x1", xIndicatorScale(mean) - 0.5)
        .attr("x2", xIndicatorScale(mean) - 0.5);

    indicatorMeanLabel = indicatorBarChart.append("svg:text")  // mean label (above bars)
        .attr("class", "tickLabel")
        .attr("x", xIndicatorScale(mean))
        .text("AVG: " + numFormatter( mean )+"%");

    initBarRects();
}

// initialize the map view, scaled to fit display width for states json
function initMap() {

    var path = d3.geo.path();

    var map = d3.select("#indicatorMap")
        .append("svg:svg")
        .attr("width",$("#indicatorMap").width())
        .attr("height",$("#indicatorMap").height())
      .append("svg:g")
        .attr("transform", "translate(10,10)scale(0.75)");

    mapBoundaries = map.append("svg:g");

    d3.json(localeData.getCurrentLevel() === levels.state ? stateMapData : countyMapData, function(json) {
        mapBoundaries.selectAll("path")
            .data(json.features)
          .enter().append("svg:path")
            .attr("id", function(d) { return "map-" + +d['id']; })
            .attr("d", path)
            .attr("class", "borders")
            .style("fill", function(d) {return colorMapLocale(d);})
            .on("mouseover", function (d) {
                d3.select(this)
                    .style("fill", highlightColor);
                highlightBarRects(+d["id"], true);
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .style("fill", function (d) { return colorMapLocale(d); });
                highlightBarRects(+d["id"], false);
            });
    });

//     d3.json("data/us-state-centroids.json", function(json) {
//         mapBoundaries.selectAll("circle")
//             .data(json.features)
//         .enter().append("svg:circle")
//             .style("fill", function(d) { return "#999"; })
//             .attr("cx", function(d) { return d.geometry[0]; })
//             .attr("cy", function(d) { return d.geometry[1]; })
//             .attr("r", function(d, i) { return 20; });
//
//     });
}

// return color for individual locales based on id
function colorMapLocale(data) {
    var id = +data['id'];
    var el = _.select(localeData.getLocaleDataForYear(), function(element) {
        return element[localeData.getFipsCode()] == id; })[0];
    if ( _.isUndefined(el) )
        return "#999";
    else
        return colorIndicatorScale(el['Numeric Value']);
}

// initialize the color legend, given an x and y position
function initLegend(startX, startY) {
    var boxWidth = 20,
        boxHeight = 20;
    var legendHeight = boxHeight + 25;

    var legend = d3.select("#colorScaleLegend")
    .append("svg:svg")
        .attr("width",$("#colorScaleLegend").width())
        .attr("height",legendHeight);

    legendBoxes = legend.selectAll("g.legend")
        .data(currentPalette)
      .enter().append("svg:g")
        .attr("class", "legend")
        .on("click", function(d) {
            currentPaletteIndex < (palettes.length-1) ? currentPaletteIndex += 1 : currentPaletteIndex = 0;
            currentPalette = palettes[currentPaletteIndex];
            changeColors();
        });

    var boxes = legendBoxes.append("svg:rect");
    setLegendBoxes(boxes, boxWidth, boxHeight);

    legendBoxes.append("svg:text")
        .attr("class", "tickLabel")
        .attr("x", function(d,i) {return i*boxWidth+(boxWidth/2);} )
        .attr("y", boxHeight)
        .attr("dy", ".71em")
        .text(function(d,i) {
            var val = i===0 ? numFormatter(minVal) : (i===currentPalette.length-1 ? numFormatter(maxVal) : '');
//            numFormatter(colorIndicatorScale.quantiles()[i];
            return val;
        });

    legend.append("svg:text")
        .attr("class", "tickLabel")
        .attr("x", (currentPalette.length*boxWidth)/2)
        .attr("y", boxHeight)
        .attr("dy", ".71em")
        .text("+/- national average");

    legend.append("svg:text")
        .attr("class", "legendReverseLabel")
        .attr("x", (boxWidth*currentPalette.length) + 5)
        .attr("y", boxHeight/2)
        .attr("dy", "0.35em")
        .text("reverse")
        .on("click", function(d) {
            currentPalette.reverse();
            changeColors();
        });
}

// set attributes and position for each individual color box in legend
function setLegendBoxes(squares, w, h) {
    squares.attr("x", function(d,i){ return i*(w); } )
        .attr("width", w)
        .attr("height", h)
        .style("fill", function(d) { return d; } );
}

// change the colors of the visualizations based on current palette
function changeColors() {
    var duration = 1000;
    var boxWidth = 20,  // duplicate - fix this
        boxHeight = 20;
    var boxes = legendBoxes.selectAll("g.legend")
        .data(currentPalette);
    boxes.enter().append("svg:rect");
    setLegendBoxes(boxes, boxWidth, boxHeight);
    boxes.exit().remove();

    colorIndicatorScale.range(currentPalette);
    indicatorBars.selectAll("rect")
      .transition()
        .duration(duration)
        .style("fill", function(d){ return colorIndicatorScale(d[val]); } );

    mapBoundaries.selectAll("path")
      .transition()
        .duration(duration)
        .style("fill", function(d) {
            var id = +d['id'];
            var el = _.select(localeData.getLocaleDataForYear(), function(element) { return element[ localeData.getFipsCode() ] == id })[0];
            return (! _.isUndefined(el)) ? colorIndicatorScale(el['Numeric Value']) : "#888";
        });

}

// initialize the year histogram/selector
function initYearHistogram() {
    var margin = 5,
        barHeight = 50,
        labelHeight = 16,
        yearLabelWidth = 220,
        histogramWidth = 220;

    var minAvg = d3.min( avgYears, function(d) { return d[avg]; } ),
        maxAvg = d3.max( avgYears, function(d) { return d[avg]; } );

    // x scale
    var xYearScale = d3.scale.ordinal()
            .domain( d3.range(minYear,maxYear+1) )
            .rangeRoundBands([0,histogramWidth], 0.2);

    // y scale
    var yYearScale = d3.scale.linear()
            .domain([0, maxAvg])
            .rangeRound([0, barHeight]);

    var yearHistogram = d3.select("#yearHistogram")
    .append("svg:svg")
        .attr("width", $("#yearHistogram").width())
        .attr("height", barHeight+labelHeight+margin*2)
    .append("svg:g")
        .attr("transform", "translate(" + margin + "," + margin + ")" );

    yearHistogram.append("svg:text")
        .attr("class", "indicatorLabel")
        .attr("dy", "0.35em")
        .text(indicatorLabel);

    yearHistogramTitle = yearHistogram.append("svg:text")
        .attr("class", "yearTitle")
        .attr("y", (barHeight + labelHeight + margin*2) / 2)
        .attr("dy", "0.35em")
        .text( localeData.getCurrentYear() );

    var yearHistContainer = yearHistogram.append("svg:g")
        .attr("transform", "translate(" + yearLabelWidth + ",0)");

    var yearHist = yearHistContainer.selectAll("g.yearBars")
        .data(avgYears)
    .enter().append("svg:g")
        .attr("class", "yearBars")
        .attr("transform", function(d,i) { return "translate(" + xYearScale(d[yr]) + ",0)"; })
        .on("click", function(d) {
            localeData.setCurrentYear( d[yr] );
            initYearData();
            yearHistogramTitle.text(localeData.getCurrentYear()); // update title for selected year
            // update fill colors of map
            d3.selectAll(".stateBorders")
                .style("fill", function(d) {return colorMapLocale(d);});
            redraw();
        });

    yearHist.append("svg:rect")
        .attr("class", "yearRects")
        .attr("width", xYearScale.rangeBand() )
        .attr("y", function(d,i) {return barHeight - yYearScale(d[avg]);} )
        .attr("height", function(d,i) {return yYearScale(d[avg]);} )
        .attr("title", function(d) { return d[yr] + ": " + d[avg]; });

    yearHist.append("svg:text")
        .attr("class", "yearLabels")
        .attr("y", barHeight + labelHeight)
        .attr("transform", function(d,i) { return "translate(-28,5)rotate(-25)"; } )
        .text(function(d) { return d[yr]; });

    yearHistContainer.append("svg:line")
        .attr("class", "tick")
        .attr("y1", barHeight)
        .attr("y2", barHeight)
        .attr("x1", 0)
        .attr("x2", histogramWidth);

}

// redraw the bar chart display based on new data (i.e. year change)
function redraw() {

    // update mean line and label
    indicatorMeanLine
        .attr("x1", xIndicatorScale(mean) - 0.5)
        .attr("x2", xIndicatorScale(mean) - 0.5);

    indicatorMeanLabel
        .attr("x", xIndicatorScale(mean))
        .text("AVG: " + numFormatter( mean )+"%");

    // remove old data
    indicatorBars = indicatorBarChart.selectAll("g.bar")
        .data([]);
    indicatorBars.exit().remove();

    initBarRects();

}

// interactive highlighting of bars by hovering on bar chart or map
function highlightBarRects(code, highlight) {
    if (highlight) {
        d3.select("#bar-" + code)
            .style("fill", highlightColor);
        d3.select("#bar-label-" + code)
            .style("fill", highlightColor)
            .style("font-weight", "800")
            .attr("x", -2);
        d3.select("#bar-value-" + code)
            .style("fill", highlightColor)
            .attr("display", "inline");
    }
    else {
        d3.select("#bar-" + code)
            .style("fill", function (d) { return colorIndicatorScale(d[val]); });
        d3.select("#bar-label-" + code)
            .style("fill", null)
            .style("font-weight", null)
            .attr("x", -8);
        d3.select("#bar-value-" + code)
            .attr("display", "none");
    }
}

// initialize the bar chart and the associated data
function initBarRects() {

    yIndicatorScale = d3.scale.ordinal()
            .domain( d3.range(localeData.getLocaleDataForYear().length) )
            .rangeRoundBands([0,barsHeight]);
    indicatorBars = indicatorBarChart.selectAll("g.bar")
        .data(localeData.getLocaleDataForYear())
    .enter().append("svg:g")
        .attr("class","bar")
        .attr("transform", function(d,i) { return "translate(0," + yIndicatorScale(i) + ")"; })
        // BUG - TODO - only works for STATES
        .on("mouseover", function (d, i) {
            highlightBarRects(d[localeData.getFipsCode()], true);
            d3.select("#map-" + d[localeData.getFipsCode()])
                .style("fill", highlightColor);
        })
        .on("mouseout", function (d, i) {
            highlightBarRects(d[localeData.getFipsCode()], false);
            d3.select("#map-" + d[localeData.getFipsCode()])
                .style("fill", function(d) {return colorMapLocale(d);});
        });

    // bars sized by 'Value' field, animated on load
    indicatorRects = indicatorBars.append("svg:rect")
        .attr("id", function(d) { return "bar-" + d[localeData.getFipsCode()]; })
        .attr("class", "rectangle")
        .style("fill", function (d) { return colorIndicatorScale(d[val]); })
        .attr("width", 1 )
        .attr("height", yIndicatorScale.rangeBand())
    .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("width", function (d) {return xIndicatorScale(d[val]);} );

    // labels on left margin for each bar
    indicatorBars.append("svg:text")
        .attr("id", function(d) { return "bar-label-" + d[localeData.getFipsCode()]; })
        .attr("class", "label")
        .attr("x", -8)
        .attr("y", yIndicatorScale.rangeBand()/2 )
        .attr("dy", ".35em")
        .text(function (d) {return d[name];} );

    // popup labels on the right side of the bars to show the Value
    indicatorBars.append("svg:text")
        .attr("id", function(d) { return "bar-value-" + d[localeData.getFipsCode()]; })
        .attr("class", "barLabel")
        .attr("display", "none")
        .attr("x", function (d) {return xIndicatorScale(d[val]);})
        .attr("y", yIndicatorScale.rangeBand() / 2)
        .attr("dx", 4)
        .attr("dy", ".35em")
        .text(function (d) {return numFormatter( d[val] )+"%";});

    // line between bars and labels
    indicatorBarChart.append("svg:line")
        .attr("class", "tick")
        .attr("y1", 0)
        .attr("y2", barsHeight);

    // ticks and rules
    var rules = indicatorBarChart.selectAll("g.rules")
        .data(xIndicatorScale.ticks(4))
      .enter().append("svg:g")
        .attr("class", "rules")
        .attr("transform", function(d) { return "translate(" + xIndicatorScale(d) + ",0)"; });

    rules.append("svg:line")  // lines through bars
        .attr("class", "vertRule")
        .attr("y1", 0)
        .attr("y2", barsHeight);

    rules.append("svg:line")  // tick marks
        .attr("class", "tick")
        .attr("y1", barsHeight)
        .attr("y2", barsHeight + 4);

    rules.append("svg:text")  // tick labels
        .attr("class", "tickLabel")
        .attr("y", barsHeight + 8)
        .attr("dy", ".71em")
        .text(xIndicatorScale.tickFormat(10));
}

// sorting actions
function transitionSortNumeric() {
    // if already numeric sort, do nothing and return
    if ( ! alphaSort ) { return -1; }

    d3.select("#indicatorBarChart").selectAll("g.bar")
        .data(localeData.getLocaleDataForYear().sort(function(a,b) { return b[val] - a[val]; }),
             function(d) { return d[name]; })
    .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("transform", function(d,i) { return "translate(0," + yIndicatorScale(i) + ")"; });

    alphaSort = false;
    d3.selectAll("#alphabetic").classed("active", alphaSort);
    d3.selectAll("#numeric").classed("active", !alphaSort);

}

function transitionSortAlphabetic() {
    // if already alpha sort, do nothing and return
    if ( alphaSort ) { return -1; }

    d3.select("#indicatorBarChart").selectAll("g.bar")
        .data(localeData.getLocaleDataForYear().sort(function(a, b) { return d3.ascending(a[name], b[name]); }),
            function(d) { return d[name]; })
    .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("transform", function(d,i) { return "translate(0," + yIndicatorScale(i) + ")"; });

    alphaSort = true;
    d3.selectAll("#alphabetic").classed("active", alphaSort);
    d3.selectAll("#numeric").classed("active", !alphaSort);

}

