// Handle a user request
exports.newSensor = function(chain, sensorName, affiliation ) {
   // Register and enroll this user.
   // If this user has already been registered and/or enrolled, this will
   // still succeed because the state is kept in the KeyValStore
   // (i.e. in '/tmp/keyValStore' in this sample).
   var registrationRequest = {
			// Sensor is a 'solution user' which should not have any roles, i think
	         roles: [  ],
	         enrollmentID: sensorName,
	         affiliation: affiliation, //'bank_a' is pre registered, how to register own groups?
	         //attributes: [{name:'role',value:'client'},{name:'account',value:userAccount}]
	    };
   chain.registerAndEnroll( registrationRequest, function(err, user) {
      if (err) return console.log("ERROR: %s",err);
		else console.log(user +" registered");
   });
}