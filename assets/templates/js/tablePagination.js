new gridjs.Grid({
  columns: ['State', 'County', 'Candidate', 'Party', 'Total Votes', 'Won'],
  pagination: {
    enabled: true,
    limit: 10
  },
  server: {
    url: 'http://127.0.0.1:5000/getAllRecords/0',
    then: data =>
      data.map(president => [
        president['state'],
        president['county'],
        president['candidate'],
        president['party'],
        president['total_votes'],
        president['won'] + ''
      ])
  }
}).render(document.getElementById('table1'))

new gridjs.Grid({
  columns: ['State', 'Total Votes'],
  pagination: {
    enabled: true,
    limit: 10
  },
  server: {
    url: 'http://127.0.0.1:5000/getAllRecords/1',
    then: data =>
      data.map(president => [president['state'], president['total_votes']])
  }
}).render(document.getElementById('table2'))

new gridjs.Grid({
  columns: ['State', 'County', 'Current Votes', 'Total Votes', 'Percent'],
  pagination: {
    enabled: true,
    limit: 10
  },
  server: {
    url: 'http://127.0.0.1:5000/getAllRecords/2',
    then: data =>
      data.map(president => [
        president['state'],
        president['county'],
        president['current_votes'],
        president['total_votes'],
        president['percent']
      ])
  }
}).render(document.getElementById('table3'))
