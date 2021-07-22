// Access flask app for election2020 data (from Mongo)
d3.json("http://127.0.0.1:5000/").then(function(data) {

  // Pull topojson data to build map (https://github.com/topojson/us-atlas)
  d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json").then(function (us) {
    
    // Define county and state data sets
    var stateData = us.objects.states;
    var countyData = us.objects.counties;

    // Define width and and height of svg
    const width = 975
    const height = 610

    // Define zoom size
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

    // Define color scale (republican red -> flip state purple -> democrat blue)
    var color = d3.scaleLinear()
    .domain([.47, .5, .53])
    .range(["red", "purple", "blue"])

    addMap()

    // FUNCTIONs

    function addMap() {
      // Add the map 

      var states = g.append("g")
          .attr("cursor", "pointer") // Add a cursor to indicate ability to click
          .attr("fill", "#444")
          .classed("map", true)
        .selectAll("path")
        .data(topojson.feature(us, stateData).features)
        .join("path") 
          .on("click", clicked)
          .attr("d", path)
          .classed("states", true)
          .style("fill", function(d) {
            var index = d.id; // index of topojson states are missing numbers (e.g. there is no "03" state id)
            var value = data.percentDemStates[index];
            return (value)? color(value): "#444"; 
          });

        states.append("title")
          .text(function (d) {
            var index = d.id;
            var value = data.percentDemStates[index]*100;
            var joeBiden = value.toFixed(1)
            var donaldTrump = (100-value).toFixed(1)
            var state = d.properties.name;
            return index ? state + " (Joe Biden: " + joeBiden + "%, Donald Trump: " + donaldTrump + "%)" : 'No Data';
          }); // hover over states to see what state




      // Add white lines between states
      var stateLines = g.append("path")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path(topojson.mesh(us, stateData, (a, b) => a !== b)))
        .classed("stateLines", true);
    };

    // Function when user clicks on a state
    function clicked (event, d) {

      // Define polygon coordinates of what was clicked. Used to zoom in on the state
      const [[x0, y0], [x1, y1]] = path.bounds(d)

      event.stopPropagation()
      
      var counties = g.append('g')
        .classed("counties", true) // Used to remove in reset function below
        .selectAll('path')
        .data(topojson.feature(us, countyData).features)
        .join('path')
          .attr('d', path)
          .attr('stroke', 'black')
          .style("fill", "transparent")
          .style('fill', function (d) {
            var index = d.id; // index of topojson states are missing numbers (e.g. there is no "03" state id)
            // If id has a 0 at the front, eliminate the 0
            if (index.charAt(0) == 0 ) {
              index = index.substring(1);
            }
            var value = data.percentDemCounties[index];
            // console.log(`${index}: ${value}`)
            return value ? color(value) : '#AAA';
          })
          .append("title")
            .text(function (d) {
              var index = d.id;
              if (index.charAt(0) == 0 ) {
                index = index.substring(1);
              }
              var value = data.percentDemCounties[index]*100;
              var joeBiden = value.toFixed(1)
              var donaldTrump = (100-value).toFixed(1)
              var county = d.properties.name;
              return index ? county + " County (Joe Biden: " + joeBiden + "%, Donald Trump: " + donaldTrump + "%)" : 'No Data';
            });


      // Add white lines between states
      var countyLines = g.append('path')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-linejoin', 'round')
        .attr('d', path(topojson.mesh(us, countyData, (a, b) => a !== b)))
        .classed("countyLines", true); // Used to remove in reset function below


      var clickState = g.append("g")
        .classed("clickState", true) // Used to remove in reset function below
        .selectAll("path")
        .data(topojson.feature(us, stateData).features)
        .join("path")
          .attr("d", path)
          .attr("stroke", "white")
          .attr("fill", "none");
        

      // Add white lines between states
      var clickStateLines = g.append("path")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path(topojson.mesh(us, stateData, (a, b) => a !== b)))
        .classed("clickStateLines", true); // Used to remove in reset function below


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
      d3.select("g.counties").remove();
      d3.select("g.clickState").remove()
      d3.selectAll("path.countyLines").remove();
      d3.selectAll("path.clickStateLines").remove();    

      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        )
    }
  });
});