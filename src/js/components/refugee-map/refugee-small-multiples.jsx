
var React = require('react');
var d3 = require('d3');


// Based on https://flowingdata.com/2014/10/15/linked-small-multiples/
// Expects data in the form:
// [{country: "GER", values: [{date: <moment>, asylumApplications: 123}, ...]}, ...]
var SmallMultiples = function(mapModel) {
  var area, bisect, caption, chart, circle, curYear, data, format, height, line,
    margin, mousemove, mouseout, mouseover, setupScales, width, xScale, xValue,
    yAxis, yScale, yValue;
  width = 150;
  height = 120;
  margin = {
    top: 15,
    right: 10,
    bottom: 50,
    left: 35
  };
  data = [];
  circle = null;
  caption = null;
  curYear = null;
  bisect = d3.bisector(function(d) {
    return d.date;
  }).left;
  xScale = d3.time.scale().range([0, width]);
  yScale = d3.scale.linear().range([height, 0]);

  xValue = function(d) {
    return d.date;
  };

  yValue = function(d) {
    return d.asylumApplications;
  };

  yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(4)
            .outerTickSize(0)
            .tickSubdivide(1)
            .tickSize(-width)
            .tickFormat(d3.format("s"));

  area = d3.svg.area()
           .x(function(d) {
             return xScale(xValue(d));
           })
           .y0(height).y1(function(d) {
             return yScale(yValue(d));
           });

  line = d3.svg.line()
           .x(function(d) {
              return xScale(xValue(d));
            })
           .y(function(d) {
              return yScale(yValue(d));
            });

  setupScales = function(data) {
    var maxY = d3.max(data, function(c) {
      if (c.country == "SRB") { return 0; } // skip Serbia. screws up scale

      return d3.max(c.values, function(d) {
        return yValue(d);
      });
    });
    yScale.domain([0, maxY]);

    var extentX = d3.extent(data[0].values, function(d) {
      return xValue(d);
    });
    xScale.domain(extentX);
  };

  chart = function(selection, rawData) {
    data = rawData;
    setupScales(data);

    var svgUpdate = selection.selectAll(".refugee-small-multiples__chart")
                     .data(data, d => d.country);

    var svgEnter = svgUpdate.enter().append("div").append("svg")
                     .attr("class", "refugee-small-multiples__chart")
                     .attr("width", width + margin.left + margin.right)
                     .attr("height", height + margin.top + margin.bottom);

    var g = svgEnter.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    g.append("rect")
      .attr("class", "refugee-small-multiples__background")
      .style("pointer-events", "all").attr("width", width + 2)
      .attr("height", height)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

    var lines = g.append("g")
                 .attr("class", "refugee-small-multiples__content");

    lines.append("path")
         .attr("class", "refugee-small-multiples__area")
         .style("pointer-events", "none")
         .attr("d", function(c) {
            return area(c.values);
          });
    lines.append("path")
         .attr("class", "refugee-small-multiples__line")
         .style("pointer-events", "none")
         .attr("d", function(c) {
            return line(c.values);
          });
    lines.append("text")
         .attr("class", "refugee-small-multiples__title")
         .attr("text-anchor", "middle")
         .attr("y", height)
         .attr("dy", margin.bottom / 2 + 5)
         .attr("x", width / 2)
         .text(function(c) {
            return mapModel.getFriendlyNameForCountry(c.country);
          });
    lines.append("text")
         .attr("class", "refugee-small-multiples__static_year start")
         .attr("text-anchor", "start").style("pointer-events", "none")
         .attr("dy", 13)
         .attr("y", height)
         .attr("x", 0)
         .text(function(c) {
            return xValue(c.values[0]).year();
          });
    lines.append("text")
         .attr("class", "refugee-small-multiples__static_year end")
         .attr("text-anchor", "end")
         .style("pointer-events", "none")
         .attr("dy", 13)
         .attr("y", height)
         .attr("x", width)
         .text(function(c) {
            return xValue(c.values[c.values.length - 1]).year();
          });

    circle = lines.append("circle")
                  .attr("r", 2.2)
                  .attr("class", "refugee-small-multiples__hidden")
                  .style("pointer-events", "none");

    caption = lines.append("text")
                   .attr("class", "refugee-small-multiples__caption")
                   .attr("text-anchor", "middle")
                   .style("pointer-events", "none")
                   .attr("dy", -8);

    curYear = lines.append("text")
                   .attr("class", "refugee-small-multiples__year")
                   .attr("text-anchor", "middle")
                   .style("pointer-events", "none")
                   .attr("dy", 13)
                   .attr("y", height);

    g.append("g")
      .attr("class", "y refugee-small-multiples__axis")
      .call(yAxis);
  };

  chart.updateData = function(selection, rawData) {
    data = rawData;
    setupScales(data);

    var svgUpdate = selection.selectAll(".refugee-small-multiples__chart")
                     .data(data, d => d.country);

    svgUpdate.select(".refugee-small-multiples__area")
      .transition().duration(150)
        .attr("d", function(c) {
          return area(c.values);
        });

    svgUpdate.select(".refugee-small-multiples__line")
      .transition().duration(150)
        .attr("d", function(c) {
          return line(c.values);
        });

    svgUpdate.select(".refugee-small-multiples__title")
      .text(function(c) {
        return mapModel.getFriendlyNameForCountry(c.country);
      });

    svgUpdate.select(".refugee-small-multiples__static_year.start")
      .text(function(c) {
        return xValue(c.values[0]).year();
      });

    svgUpdate.select(".refugee-small-multiples__static_year.end")
      .text(function(c) {
        return xValue(c.values[c.values.length - 1]).year();
      });

    svgUpdate.select(".y.refugee-small-multiples__axis")
      .call(yAxis);

    circle = svgUpdate.select(".refugee-small-multiples__content circle");
    caption = svgUpdate.select(".refugee-small-multiples__caption");
    curYear = svgUpdate.select(".refugee-small-multiples__year");
  };

  mouseover = function() {
    circle.classed("refugee-small-multiples__hidden", false);
    d3.selectAll(".refugee-small-multiples__static_year")
      .classed("refugee-small-multiples__hidden", true);
    mousemove.call(this);
  };

  mousemove = function() {
    var date = xScale.invert(d3.mouse(this)[0]);
    // the data points are placed at the beginning of each month.
    // we need to round the date to the point for each month.
    var beginningOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    var index = 0;

    circle.attr("cx", xScale(beginningOfMonth))
          .attr("cy", function(c) {
            index = bisect(c.values, beginningOfMonth, 0, c.values.length - 1);
            return yScale(yValue(c.values[index]));
          });

    caption.attr("x", xScale(beginningOfMonth))
           .attr("y", function(c) {
              return yScale(yValue(c.values[index]));
            })
           .text(function(c) {
              return yValue(c.values[index]);
            });

    curYear.attr("x", xScale(beginningOfMonth))
           .text(d3.time.format("%m/%Y")(beginningOfMonth));
  };

  mouseout = function() {
    d3.selectAll(".refugee-small-multiples__static_year")
      .classed("refugee-small-multiples__hidden", false);
    circle.classed("refugee-small-multiples__hidden", true);
    caption.text("");
    curYear.text("");
  };

  return chart;
};



var RefugeeSmallMultiplees = React.createClass({


  getSourceData: function() {
    var data = this.props.refugeeCountsModel.getEuroFigures(this.props.countryFigures, 25);

    return data.map(item => {
      return {
        country: item.country,
        values: this.props.refugeeCountsModel.getGlobalArrivingPerMonthForCountry(item.country)
      };
    });
  },


  getData: function() {
      var data = this.getSourceData();

      if (this.props.relativeToPopulation) {
        data.forEach(countryItem => {
          countryItem.values.forEach(valueItem => {
            valueItem.asylumApplications =
              Math.round(valueItem.asylumApplications /
                this.props.countryFigures[countryItem.country].population *
                this.props.populationDivider);
          });
        });
      }
      return data;
  },


  getPlot: function() {
    if (this.plot === undefined) {
      this.plot = SmallMultiples(this.props.mapModel);
    }

    return this.plot;
  },


  componentDidMount: function() {
    this.draw();
  },


  componentDidUpdate: function() {
    this.redraw();
  },


  draw: function(redrawing) {
    var data = this.getData();
    var graph = this.getPlot();
    graph(d3.select(".small-multiples"), data);
  },


  redraw: function() {
    var data = this.getData();
    var graph = this.getPlot().updateData;
    graph(d3.select(".small-multiples"), data);
  },


  render: function() {
    return (
      <div className="small-multiples" />
    );
  }

});


module.exports = RefugeeSmallMultiplees;
