
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

	// Connection URL
	var url = process.env.DATABASE_URL;

	// Use connect method to connect to the server
	// MongoClient.connect(url, function(err, db) {
	  // assert.equal(null, err);
	  // console.log("Connected successfully to database");

	  // db.close();
	// });
	
exports.sensorExists = function(id, cb){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('sensors');
		// Insert some documents
		collection.find({'id' : id}.limit(1).toArray(function(err, docs) {
			assert.equal(err, null);
			console.log("Inserted 1 document into the collection");
			
			if(typeof cb !== 'undefined'){
				if(docs.length == 1)
					cb(true);
				else
					cb(false);
			}
		});
	  
		db.close();
	});
	
}

exports.insertSensor = function(id, flag, cb){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('sensors');
		// Insert some documents
		collection.insertOne({'id' : id, 'flag' : flag},
		function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.insertedCount);
			console.log("Inserted 1 document into the collection");
			
			if(typeof cb !== 'undefined')
				cb(result);
		});
	  
		db.close();
	});
	
}

exports.setSensorDescription = function(id, desc, cb){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('sensors');
		// Insert some documents
		collection.updateOne({'id' : id}, {'description' : desc}, null,
		function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.result.n);
			console.log("updated 1 document in the collection");
			
			if(typeof cb !== 'undefined')
				cb(result);
		});
	  
		db.close();
	});
	
}

exports.setSensorFlag = function(id, flag, cb){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('sensors');
		// Insert some documents
		collection.updateOne({'id' : id}, {'flag' : flag}, null,
		function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.result.n);
			console.log("updated 1 document in the collection");
			
			if(typeof cb !== 'undefined')
				cb(result);
		});
	  
		db.close();
	});
	
}

exports.insertData = function(timestamp, sensor, /*type,*/ data, cb){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('data');
		// Insert some documents
		collection.insertOne({'timestamp' : timestamp, 'sensor' : sensor, /*'type' : type,*/ 'data' : data},
		function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.insertedCount);
			console.log("Inserted 1 document into the collection");
			
			if(typeof cb !== 'undefined')
				cb(result);
		});
	  
		db.close();
	});
	
}

exports.getSensorData = function(sensor, tsfrom, tsto){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('data');
		// Insert some documents
		collection.find({'sensor' : sensor, 'timestamp' : {$gt : tsfrom, $lt : tsto}}.toArray(function(err, docs) {
			assert.equal(err, null);
			console.log("Inserted 1 document into the collection");
			
			if(typeof cb !== 'undefined')
				cb(docs);
		});
	  
		db.close();
	});
	
}

exports.getSensorFlag = function(id, flag, cb){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");
	  
		var collection = db.collection('sensors');
		// Insert some documents
		collection.find({'id' : id}, {'flag' : flag}.limit(1).toArray(function(err,docs){
			assert.equal(err, null);
			console.log("Retrived 1 document in the collection");
			
			if(typeof cb !== 'undefined')
				cb(result);
		});
	  
		db.close();
	});
	
}

exports.deleteSensor = function(id,cb){
	MongoClient.connect(url,function(err,db){
		assert.equal(null,err);
		console.log("Connected succesfully to database");
		
		var collection = db.collection('sensors').deleteMany(
		{'id' : id},
		function(err,null){
			console.log("Removed 1 document in the collection");
			
			if(typeof cb !== 'undefined')
				cb(result);
			
		});
		db.close();
	}
}


	  

