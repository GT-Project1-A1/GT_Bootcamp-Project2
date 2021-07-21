d3.json('http://127.0.0.1:5000/getAllRecords/1').then(function (data) {
  filtered_data = data.filter(d => d.state != 'United States')
  labels = filtered_data.map(d => d.state)
  filtered_labels = labels.filter(d => d != 'United States')
  values = filtered_data.map(d => d['total_votes'])
  graph_data = [
    {
      type: 'pie',
      labels: labels,
      values: values,
      textinfo: 'value',
      hoverinfo: 'label+value',
      textposition: 'inside',
      insidetextorientation: 'radial'
    }
  ]
  var layout = [
    {
      title: 'State vs Total No.of Votes Registered',
      margin: { l: 0, r: 0, b: 0, t: 0 },
      width: 100,
      height: 700
    }
  ]

  Plotly.newPlot('pieChart', graph_data, layout)
})
