var selItem = sessionStorage.getItem("SelItem");
window.onload = function() {
  var selItem = sessionStorage.getItem("SelItem");  
  $('#ddlViewBy').val(selItem);
  }
  $('#ddlViewBy').change(function() { 
      var selVal = $(this).val();
      sessionStorage.setItem("SelItem", selVal);
  });
  console.log(selItem)
//var dropdown = d3.select("#ddlViewBy")
      //var change = function() {
        //var source = dropdown.node().options[dropdown.node().selectedIndex].value;
        var e = document.getElementById("ddlViewBy");
var strUser = e.value
        if (selItem == "1") {

            var z = 1;
        
            } else if (selItem == "2") {
        
            var z = 2;
        
            }
console.log(z)
        
        
        //dropdown.on("change", change)
//d3.selectAll("path").remove();
//change();

var width = 960,
    height = 600;

var formatNumber = d3.format(",.0f");

var path = d3.geoPath()
    .projection(null);

var radius = d3.scaleSqrt()
    .domain([0, 1e6])
    .range([0, 20]);

var svg = d3.select("#bubblemap").append("svg")
    .attr("width", width)
    .attr("height", height);

var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 70) + "," + (height - 20) + ")")
  .selectAll("g")
    .data([1e6, 5e6, 1e7])
  .enter().append("g");

legend.append("circle")
    .attr("cy", function(d) { return -radius(d); })
    .attr("r", radius);

legend.append("text")
    .attr("y", function(d) { return -2 * radius(d); })
    .attr("dy", "1.3em")
    .text(d3.format(".1s"));

d3.json("http://127.0.0.1:5000/", function(data) {
  //if (error) throw error;
d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    svg.append("path")
      .datum(topojson.feature(us, us.objects.nation))
      .attr("class", "land")
      .attr("d", path);

    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path);

    svg.append("g")
      .attr("class", function (f) {
        if (z==1) { 
          return "bubble"
        }else if(z==2){
          return "bubble2"
        }
      })
      .selectAll("circle")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("circle")
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("r", function(d) {
      var index = d.id;
      if (index.charAt(0) == 0 ) {
        index = index.substring(1);
      }
      var Bvalue = data.Bcountyvotecount[index];
      var Tvalue = data.Tcountyvotecount[index];
     if (z==1) {
          return radius(Bvalue)
      }else if(z==2){
          return radius(Tvalue)};
      })
     // .append("title")
      //.text(function(d) {
        //var index = d.id;
        //if (index.charAt(0) == 0 ) {
          //index = index.substring(1);
        //}
        //var county = d.properties.name;
        //return index ? county + "\nPopulation " + formatNumber(data.properties.population);
      //});
      
      
      
      
        
    

      
      
      //var dropdown = d3.select("#ddlViewBy")
      //var change = function() {
        //var source = dropdown.node().options[dropdown.node().selectedIndex].value;
        //if (source == "1") {

            //var a = Bvalue;
        
            //} else if (source == "2") {
        
            //var a = Tvalue;
        
            //}
            
      
      //return radius(Bvalue);
    
    
       
});
});



d3.select(self.frameElement).style("height", height + "px");
dropdown.on("change", change)
d3.selectAll("path").remove();
change();





  


//function show() {
    //var e = document.getElementById("ddlViewBy");
    //var strUser = e.value;
    //document.getElementById('ddlViewBy').addEventListener('change', function() {
        //strUser=  (this.value);
      //});

      
 //   }
  //  e.onchange=show;
    //show()