d3.json("http://127.0.0.1:5000/").then(function(data) {
  data.forEach(element => {
    console.log(element);    
  });
});