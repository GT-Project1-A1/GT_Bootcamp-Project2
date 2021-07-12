//us = fetch("states-albers-10m.json").json()

// Access flask app for election2020 data (from Mongo)
d3.json("http://127.0.0.1:5000/").then(function(data) {

  // Pull election data. Calculate Joe Biden's % votes compared to Donald Trump by state
  


  // Pull topojson data to build map
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
  
  // Add the map
  const states = g.append("g")
      .attr("fill", "#444")
      .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .join("path")
      // .on("click", clicked)
      .attr("d", path);


  // Build color scale
  var myColor = d3.scaleLinear()
    .range(["red", "blue"])
    .domain([0,1]);

  // g.append("path")
  //   .attr("fill", "none")
  //   .attr("stroke", "white")
  //   .attr("stroke-linejoin", "round")
  //   .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));
  });
});

//   d3.json("js/states-albers-10m.json").then(function(us) {
  
//   console.log(us);

//   const width = 975;
//   const height = 610;

//   const zoom = d3.zoom()
//       .scaleExtent([1, 8])
//       .on("zoom", zoomed);

//   const svg = d3.select("#USmap")
//     .append("svg")
//     .attr("viewBox", [0, 0, width, height])
//     .on("click", reset);
  
  
  
  
  
  // const g = svg.append("g");

  // const states = g.append("g")
  //   .attr("fill", "#444")
  //   .attr("cursor", "pointer")
  //   .selectAll("path")
  //   .data(topojson.feature(us, us.objects.states).features)
  //   .join("path")
  //     .on("click", clicked)
  //     .attr("d", path);
  
  // states.append("title")
  //     .text(d => d.properties.name);

  // g.append("path")
  //     .attr("fill", "none")
  //     .attr("stroke", "white")
  //     .attr("stroke-linejoin", "round")
  //     .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

  // svg.call(zoom);

  // function reset() {
  //   states.transition().style("fill", null);
  //   svg.transition().duration(750).call(
  //     zoom.transform,
  //     d3.zoomIdentity,
  //     d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
  //   );
  // }

  // function clicked(event, d) {
  //   const [[x0, y0], [x1, y1]] = path.bounds(d);
  //   event.stopPropagation();
  //   states.transition().style("fill", null);
  //   d3.select(this).transition().style("fill", "red");
  //   svg.transition().duration(750).call(
  //     zoom.transform,
  //     d3.zoomIdentity
  //       .translate(width / 2, height / 2)
  //       .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
  //       .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
  //     d3.pointer(event, svg.node())
  //   );
  // }

  // function zoomed(event) {
  //   const {transform} = event;
  //   g.attr("transform", transform);
  //   g.attr("stroke-width", 1 / transform.k);
  // }

  // return svg.node();


  // data.forEach(element => {
  //   console.log(element);    
  // });

