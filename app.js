// margin
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 250 - margin.right - margin.left,
    height = 250 - margin.top - margin.bottom,
    radius = width/2;

// color range
var color = d3.scaleOrdinal()
    .range(["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2"]);

// pie chart arc. Need to create arcs before generating pie
var arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);



// arc for the labels position
var labelArc = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);


// define the svg for pie chart
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var div = d3.select("body")
        .append("div") 
        .attr("class", "tooltip");



// format number with comma
var formatComma = d3.format(",")


// generate pie chart and donut chart

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.Revenue; });



// import data 
d3.csv("dataset.csv", function(error, data) {
  if (error) throw error;
  
  // group data together 

  data = d3.nest()
      .key(function(d){ return d.ConsumerGroup})
      .rollup(function(values) {
        return d3.sum(values, function(v) { return v.Revenue});
      }).entries(data);

    // parse data
    data.forEach(function(d) {
        d.ConsumerGroup = d.key;
        d.Revenue = d.value
    
    })



  // "g element is a container used to group other SVG elements"
  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("class", "arc")
      .on("mousemove",function(d){
        var mouseVal = d3.mouse(this);
        div.style("display","none")
        .html("Revenue: "+ formatComma(d.data.Revenue))
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 10) + "px")
        .style("opacity", 1)
        .style("display","block")
        .style('position', 'absolute')
    })
    .on("mouseout",function(){div.html(" ").style("display","none");})

  // append path 
  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color(d.data.ConsumerGroup); })
    // transition 
    .transition()
      .ease(d3.easeLinear)
      .duration(2000)
      .attrTween("d", tweenPie);
        
  // append text
  g.append("text")
    .transition()
      .ease(d3.easeLinear)
      .duration(2000)
    .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".50em")
      .attr("text-anchor", "middle")
      .style("font-size", "7px")
      .style('font-family', 'Arial', 'serif')
      .style('text-align', 'center')
      .text(function(d) { return d.data.ConsumerGroup; });
    
    
});

// Helper function for animation of pie chart and donut chart
function tweenPie(b) {
  b.innerRadius = 0;
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
  return function(t) { return arc(i(t)); };
}

