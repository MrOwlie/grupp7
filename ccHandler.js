
var TheChain = null;

exports.setChain = function(chain){
	TheChain = chain;
}

exports.upsertSensor = function(sensorName, datatype, cb ) {
   // Register and enroll this user.
   // If this user has already been registered and/or enrolled, this will
   // still succeed because the state is kept in the KeyValStore
   // (i.e. in '/tmp/keyValStore' in this sample).
   TheChain.getMember(sensorName, function(err, sensor){
		if(err){
			return console.log("Error retreiving sensor at sensor submit AJAX");
		}

		if(!sensor.isRegistered() && !sensor.isEnrolled()){
			var registrationRequest = {
			// Sensor is a 'solution user' which should not have any roles, i think
	         roles: [  ],
	         enrollmentID: sensorName,
	         affiliation: 'bank_a', //'bank_a' is pre registered, how to register own groups?
	         attributes: [{name:'type',value:'sensor'},{name:'datatype',value:datatype}]
			};
			
		   TheChain.registerAndEnroll( registrationRequest, function(err, user) {
			  if (err) return console.log("ERROR: %s",err);
				else console.log(sensorName +" registered");
				
				cb(user);
		   });
		}
		else
			cb(sensor);
		
   });
}

exports.isEnrolled = function(sensorName, cb){
	TheChain.getMember(sensorName, function(err, sensor){
		if(err){
			return console.log("Error retreiving sensor at sensor submit AJAX");
		}
		if(sensor.isRegistered() && sensor.isEnrolled())
			cb(true);
		else
			cb(false);

	});
}

exports.userInvoke = function(user, chaincode, func, ccargs, comfcn, erfcn){
	TheChain.getMember(user, function(err, member){
		if(err)
			return console.log("Could not find member " + user);

		var invokeRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincode,
        // Function to trigger
        fcn: func,
        // Parameters for the invoke function
        args: ccargs
		};
		console.log(ccargs);
		var tx = member.invoke(invokeRequest);
		console.log(user+" started invoke");
		 // Listen for the 'submitted' event
		 tx.on('submitted', function(results) {
			console.log("submitted invoke: %j",results);
		 });
		 // Listen for the 'complete' event.
		 tx.on('complete', function(results) {
			console.log("completed invoke: %j",results);
			comfcn(results);
		 });
		 // Listen for the 'error' event.
		 tx.on('error', function(err) {
			console.log("error on invoke: %j",err);
			erfcn(err);
		 });
	});
}

exports.userQuery = function(user, chaincode, func, ccargs, comfcn, erfcn){
	TheChain.getMember(user, function(err, member){
		if(err)
			return console.log("Could not find member " + user);

		var queryRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincode,
        // Function to trigger
        fcn: func,
        // Parameters for the invoke function
        args: ccargs
		};
		console.log(ccargs);
		var tx = member.query(queryRequest);
		console.log(user+" started query");
		 // Listen for the 'submitted' event
		 tx.on('submitted', function(results) {
			console.log("submitted query: %j",results);
		 });
		 // Listen for the 'complete' event.
		 tx.on('complete', function(results) {
			console.log("completed query: %j",results);
			comfcn(results);
      //Return results?
		 });
		 // Listen for the 'error' event.
		 tx.on('error', function(err) {
			console.log("error on query: %j",err);
			erfcn(err);
		 });
	});
}
