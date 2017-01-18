var http = require('http');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

	// Connection URL
	var url = 'mongodb://localhost:27017/myproject';

	// Use connect method to connect to the server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected successfully to server");

	  db.close();
	});

var server = http.createServer(function(req, res) {
	
  res.writeHead(200);
  res.end('Hello Http');
  console.log("hej");
});
server.listen(8080);