
// Access flask app for election2020 data (from Mongo)
d3.json("http://127.0.0.1:5000/").then(function(data) {

  var percentData = Object.values(data);

  console.log(data);

  // Pull topojson data to build map (https://bl.ocks.org/mbostock/4090848)
  d3.json("https://unpkg.com/us-atlas@1/us/10m.json").then(function(us) {

    // Define width and and height of svg
    const width = 975;
    const height = 610;

    // Append svg and define attributes
    var  usMap = d3.select("#USmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

  // Define path to use later
  var path = d3.geoPath();

  // Select into svg and append the graph
  var svg = d3.select("svg");
  var g = svg.append("g")
  
  var color = d3.scaleLinear()
    .range(["red", "blue"])
    .domain([0,1]);

  color.domain(d3.extent(_.toArray(percentData)));

  // Add the map 
  const states = g.append("g")
      .attr("cursor", "pointer")
      .style("fill", "green")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path") 
      // .on("click", clicked)
      .attr("d", path)
      .style("fill", function(d,i) {
        var index = d.id;
        var value = data[index];
        return (value)? color(value) : "#AAA"; 
      });

  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)))
  });
});