// Access flask app for election2020 data (from Mongo)
d3.json("http://127.0.0.1:5000/").then(function(data) {

  var counties;
  var percentData = Object.values(data.percentDem);

  // Pull topojson data to build map (https://bl.ocks.org/mbostock/4090848)
  d3.json('https://unpkg.com/us-atlas@1/us/10m.json').then(function (us) {
    // Define county and state data sets
    var countyData = us.objects.counties;
    var stateData = us.objects.states;

    // Define width and and height of svg
    const width = 975
    const height = 610

    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed)

    // Append svg and define attributes
    var usMap = d3
      .select('#USmap')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('viewBox', [0, 0, width, height])
      .on('click', reset)

    // Allow users to reset map if they click outside of the svg
    var body = d3.select('body').on('click', reset)

    // Define path to use later
    var path = d3.geoPath()

    // Select into svg and append the graph
    var svg = d3.select('svg')
    var g = svg.append('g')

    // Define color
    var color = d3.scaleLinear()
    .domain([0, .5, 1])
    .range(["red", "purple", "blue"])

    var states
    addMap()

      
  // FUNCTION

  function addMap() {
    // Add the map 
    states = g.append("g")
        .attr("cursor", "pointer")
        .attr("fill", "#444")
        .classed("map", true)
        .selectAll("path")
          .data(topojson.feature(us, stateData).features)
          .enter().append("path") 
            .on("click", clicked)
            .attr("d", path)
            .style("fill", function(d) {
              var index = d.id; // index of topojson states are missing numbers (e.g. there is no "03" state id)
              var value = data.percentDem[index];
              console.log(value);
              return (value)? color(value): "#444"; 
            });

    // Add white lines between states
    g.append("path")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(us, stateData, (a, b) => a !== b)))
    .classed("states", true);
  }
  
  
  // Function when user clicks on a state
  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);

    event.stopPropagation();

    states.transition()
    .style("fill", null)
    .selectAll("path")

    counties = g.append("g").selectAll("path")
      .data(topojson.feature(us, countyData).features)
      .enter().append("path") 
        .attr("d", path)
        .attr("stroke", "black")
        .style("fill", function(d) {
          var index = d.id; // index of topojson states are missing numbers (e.g. there is no "03" state id)
          var value = data.countyIDs;
          return (value)? color(value) : "green"; 
    });

      // Add white lines between states
      g.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('d', path(topojson.mesh(us, stateData, (a, b) => a !== b)))
        .classed('counties', true)
    }

    // Function when user clicks on a state
    function clicked (event, d) {
      const [[x0, y0], [x1, y1]] = path.bounds(d)

      event.stopPropagation()

      states
        .transition()
        .style('fill', null)
        .selectAll('path')

      counties = g
        .append('g')
        .selectAll('path')
        .data(topojson.feature(us, countyData).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('stroke', 'black')
        .style('fill', function (d) {
          var index = d.id // index of topojson states are missing numbers (e.g. there is no "03" state id)
          console.log(index)
          var value = data[index]
          return value ? color(value) : 'green'
        })

      // Add white lines between states
      g.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('d', path(topojson.mesh(us, stateData, (a, b) => a !== b)))

      // d3.select(this)
      //   .transition()
      //   .style("fill", "black")

      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(
              Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height))
            )
            .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
          d3.pointer(event, svg.node())
        )
    }

    // Function adjust graph as you zoom in on it
    function zoomed (event) {
      const { transform } = event
      g.attr('transform', transform)
      g.attr('stroke-width', 1 / transform.k)
    }

    // Function to reset the page after user has click away from counties view
    function reset () {
      states.style('fill', function (d, i) {
        var index = d.id
        var value = data[index]
        return value ? color(value) : '#AAA'
      })

      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        )
    }
  })
})
