
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
	
exports.setSystemKeyVal = function(key, val, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('system');
		// Insert some documents
		collection.findOneAndReplace({'key' : key}, {'key': key, 'val' : val}, {upsert : true}, function(err, doc) {
			assert.equal(err, null);
			
			console.log("Updated 1 document in the collection");
			if(typeof cb !== 'undefined')
				cb(doc);
		});
		
		db.close();
	});

}

exports.getSystemKeyVal = function(key, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('system');
		// Insert some documents
		collection.find({'key' : key}).limit(1).toArray(function(err,docs){
			assert.equal(err, null);
			console.log("Retrived 1 document in the collection");

			if(typeof cb !== 'undefined')
				cb(docs);
		});

		db.close();
	});

}

exports.sensorExists = function(cid, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('sensors');
		// Insert some documents
		collection.find({'id' : cid}).limit(1).toArray(function(err, docs) {
			assert.equal(err, null);

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

exports.insertSensor = function(id, flag, desc, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('sensors');
		// Insert some documents
		collection.insertOne({'id' : id, 'flag' : flag, 'desc' : "", 'groups' : []},
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

exports.setSensorSettings = function(id, desc, groups, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('sensors');
		// Insert some documents
		collection.updateOne({'id' : id}, {$set:{'desc' : desc, 'groups' : groups}}, null,
		function(err, result) {
			assert.equal(err, null);
			assert.equal(1, result.result.n);
			console.log("updated 1 document in the collection");

			if(typeof cb !== 'undefined')
				cb(result);
		});
		
		exports.updateGroupList(groups);

		db.close();
	});

}

exports.updateGroupList = function(groups){
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('groups');
		// Insert some documents
		groups.forEach(function(elem){
			collection.findAndModify({'name' : elem}, [['name', 1]], {$setOnInsert:{'name' : elem}}, {upsert:true},
			function(err, result) {
				assert.equal(err, null);
			});
		});
		console.log("Updated groups lists");

		db.close();
	});
	
}

// exports.setSensorType = function(id, type, cb){

	// MongoClient.connect(url, function(err, db) {
		// assert.equal(null, err);
		// console.log("Connected successfully to database");

		// var collection = db.collection('sensors');
		// // Insert some documents
		// collection.updateOne({'id' : id}, {$set:{'type' : type}}, null,
		// function(err, result) {
			// assert.equal(err, null);
			// assert.equal(1, result.result.n);
			// console.log("updated 1 document in the collection");

			// if(typeof cb !== 'undefined')
				// cb(result);
		// });

		// db.close();
	// });

// }


exports.setSensorFlag = function(id, flag, cb){
	var newFlag = parseInt(flag);

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('sensors');
		// Insert some documents
		collection.updateOne({'id' : id}, {$set: {'flag' : newFlag}}, null,
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

exports.insertData = function(timestamp, sensor, data, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		exports.getSensor(sensor, function(doc){
			
			doc.groups.forEach(function(grp){
				var collection = db.collection(grp);
				// Insert some documents
				collection.insertOne({'timestamp' : timestamp, 'sensor' : sensor, /*'type' : type,*/ 'data' : data},
				function(err, result) {
					assert.equal(err, null);
					assert.equal(1, result.insertedCount);
					console.log("Inserted 1 document into the collection " + grp);

					if(typeof cb !== 'undefined')
						cb(result);
					
					db.close();
				});
			});
			
		});
		
		
	});

}

exports.getSensor = function(sensid, cb){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to the database.")

        var collection = db.collection('sensors');
        collection.findOne({'id':sensid}, {limit:1}, function(err, docs){
            assert.equal(err, null);
            console.log("Fetched document on sensor " + sensid);
            if(typeof cb != 'undefined'){
                cb(docs);
            }
			db.close();
        });

    });
}

exports.getSensors = function(cb){
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to the database.")

        var collection = db.collection('sensors');
        collection.find().toArray(function(err, docs){
            assert.equal(err, null);
            console.log("Fetched cursor over all documents in collection('sensors')");
            if(typeof cb != 'undefined'){
                cb(docs);
            }
        });

        db.close();
    });
}

exports.getSensorData = function(group, /*tsfrom, tsto,*/ cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection(group);
		// Insert some documents
		collection.find({/*, 'timestamp' : {$gt : tsfrom, $lt : tsto}*/}).toArray(function(err, docs) {
			assert.equal(err, null);
			console.log("Fetched sensor data");

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
		}));

		db.close();
	});

}

exports.deleteSensor = function(id,cb){
	MongoClient.connect(url,function(err,db){
		assert.equal(null,err);
		console.log("Connected succesfully to database");

		var collection = db.collection('sensors').deleteMany(
		{'id' : id},
		function(err, result){
			console.log("Removed 1 document in the collection");

			if(typeof cb !== 'undefined')
				cb(result);

		});
		db.close();
	});
}

exports.thirdPartyExists = function(id, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('thirdParties');
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
		}));

		db.close();
	});

}

exports.insertThirdParty = function(id, flag, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('thirdParties');
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

exports.setThirdPartyDescription = function(id, desc, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('thirdParties');
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


exports.setThirdPartyFlag = function(id, flag, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('thirdParties');
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

exports.getThirdPartyFlag = function(id, flag, cb){

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected successfully to database");

		var collection = db.collection('thirdParties');
		// Insert some documents
		collection.find({'id' : id}, {'flag' : flag}.limit(1).toArray(function(err,docs){
			assert.equal(err, null);
			console.log("Retrived 1 document in the collection");

			if(typeof cb !== 'undefined')
				cb(result);
		}));

		db.close();
	});

}

exports.deleteThirdParty = function(id,cb){
	MongoClient.connect(url,function(err,db){
		assert.equal(null,err);
		console.log("Connected succesfully to database");

		var collection = db.collection('thirdParties').deleteMany(
		{'id' : id},
		function(err, result){
			console.log("Removed 1 document in the collection");

			if(typeof cb !== 'undefined')
				cb(result);

		});
		db.close();
	});
}
