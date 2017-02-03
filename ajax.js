//This file contains all the apps ajax functions

exports.sensorSubmit = function(chain, db, req, res) {
	res.header("Access-Control-Allow-Origin", "*")
	var ID = req.query.id;
	var data = req.query.data;
	
	chain.getMember(ID, function(err, sensor){
		if(err) return console.log("Error retreiving sensor at sensor submit AJAX");
		
		if(sensor.isRegistered() && sensor.isEnrolled()){
			sensorInvoke(sensor, "auth", "increment", [], 
			function(result){ //submit handler
				console.log("Invoke started");
			},
			function(result){ //completion handler
			
				db.insertData(Date.now(), ID, data);
				
				console.log("Invoke completed");
				res.send('success');
			},
			function(err){ //error handler
				console.log("Invoke failed");
				
				//något resultat som ber sensor skicka om sin data...
				
				res.send('fail');
			});
		}
		else{
			
			db.sensorExists(ID, function(itdoes){
				if(!itdoes){
					db.insertSensor(ID, 1);
				}
			});
			
			return;
		}
		
	});
}

exports.dataRequest = function(chain, db, req, res) {
	res.header("Access-Control-Allow-Origin", "*")
	var ID = req.query.id;
	var request = req.query.request;
	
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
				
				//något resultat som ber sensor skicka om sin data...
				
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