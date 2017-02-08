//This file contains all the apps ajax functions

exports.sensorSubmit = function(chain, db, req, res) {
	
	var sensID = req.body.ID;
	var date = req.body.date;
	var data = req.body.data;
	

	chain.getMember(sensID, function(err, sensor){
		if(err){
			console.log("Error retreiving sensor at sensor submit AJAX");
			res.end('{"response":"error"}');
		}

		if(sensor.isRegistered() && sensor.isEnrolled()){
			sensorInvoke(sensor, "temperature", "read", [],
			function(result){ //submit handler
				console.log("Invoke started");
			},
			function(result){ //completion handler

				db.insertData(/*date*/new Date(), sensID, data);

				console.log("Invoke completed");
				res.end('{"response":"success"}');
			},
			function(err){ //error handler
				console.log("Invoke failed");

				//n�got resultat som ber sensor skicka om sin data...

				res.end('{"response":"error"}');
			});
		}
		else{

			db.sensorExists(sensID, function(itdoes){
				if(!itdoes){
					db.insertSensor(sensID, 1);
					res.end('{"response":"placed in queue"}');
				}
				else
					res.end('{"response":"already in queue"}');
			});

		}

	});
}

exports.dataRequest = function(chain, db, req, res) {
	res.header("Access-Control-Allow-Origin", "*")
	var ID = req.body.id;
	var request = req.body.request;

	chain.getMember(ID, function(err, user){
		if(err) return console.log("Error retreiving user at data request AJAX");

		if(user.isRegistered() && user.isEnrolled()){
			sensorInvoke(user, "auth", "increment", [],
			function(result){ //submit handler
				console.log("Invoke started");
			},
			function(result){ //completion handler

				//store transaction hash in DB?

				console.log("Invoke completed");
				res.send('success');
			},
			function(err){ //error handler
				console.log("Invoke failed");

				//n�got resultat som ber sensor skicka om sin data...

				res.send('fail');
			});
		}
		else{

			//DB check if blocked or on whitelist queue

			return;
		}

	});
}

function sensorInvoke(sensor, chaincode, func, ccargs, sub, comp, err){

		var invokeRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincode,
        // Function to trigger
        fcn: func,
        // Parameters for the invoke function
        args: ccargs
		};

		var tx = sensor.invoke(invokeRequest);
		console.log("Sensor started invoke");
		 // Listen for the 'submitted' event
		 tx.on('submitted', sub);
		 // Listen for the 'complete' event.
		 tx.on('complete', comp);
		 // Listen for the 'error' event.
		 tx.on('error', err);

}
