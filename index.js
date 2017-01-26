// library for handling sensors
var sensor = require('./sensor');
var express = require('express');
var app = express()
var hfc = require('hfc');
var chain;

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

	// Connection URL
	var url = process.env.DATABASE_URL;

	// Use connect method to connect to the server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected successfully to database");

	  db.close();
	});
	
startupHyperledger();

app.get('/', function(req, res){
	res.send('Main page');
});

app.get('/new', function(req, res){
	res.send('new sensor');
	sensor.newSensor(chain, "test");
	// chain.getMember("test", function(err, member){
		// if(err)
			// return console.log("Could not find member");
		// console.log(member.isRegistered());
	// });
});

app.listen(8080, function(){
	console.log('page requested');
})

function startupHyperledger(){
console.log(" **** starting HFC sample ****");


// get the addresses from the docker-compose environment
var PEER_ADDRESS         = process.env.CORE_PEER_ADDRESS;
var MEMBERSRVC_ADDRESS   = process.env.MEMBERSRVC_ADDRESS;

var chain, chaincodeID;

// Create a chain object used to interact with the chain.
// You can name it anything you want as it is only used by client.
chain = hfc.newChain("mychain");
// Initialize the place to store sensitive private key information
chain.setKeyValStore( hfc.newFileKeyValStore('/tmp/keyValStore') );
// Set the URL to membership services and to the peer
console.log("member services address ="+MEMBERSRVC_ADDRESS);
console.log("peer address ="+PEER_ADDRESS);
chain.setMemberServicesUrl("grpc://"+MEMBERSRVC_ADDRESS);
chain.addPeer("grpc://"+PEER_ADDRESS);

// The following is required when the peer is started in dev mode
// (i.e. with the '--peer-chaincodedev' option)
var mode =  process.env['DEPLOY_MODE'];
console.log("DEPLOY_MODE=" + mode);
if (mode === 'dev') {
    chain.setDevMode(true);
    //Deploy will not take long as the chain should already be running
    chain.setDeployWaitTime(10);
} else {
    chain.setDevMode(false);
    //Deploy will take much longer in network mode
    chain.setDeployWaitTime(120);
}


chain.setInvokeWaitTime(10);


 // Enroll "WebAppAdmin" which is already registered because it is
// listed in fabric/membersrvc/membersrvc.yaml with its one time password.
// If "WebAppAdmin" has already been registered, this will still succeed
// because it stores the state in the KeyValStore
// (i.e. in '/tmp/keyValStore' in this sample).
chain.enroll("WebAppAdmin", "DJY27pEnl16d", function(err, webAppAdmin) {
   if (err) return console.log("ERROR: failed to register %s: %s",err);
   // Successfully enrolled WebAppAdmin during initialization.
   // Set this user as the chain's registrar which is authorized to register other users.
   console.log("Enrolled WebAppAdmin");
   chain.setRegistrar(webAppAdmin);
   //deploy(webAppAdmin);
   
   
   // Now begin listening for web app requests
   //listenForUserRequests();
});
}

// Deploy chaincode
function deploy(user) {
   console.log("deploying chaincode; please wait ...");
   // Construct the deploy request
   var deployRequest = {
       chaincodeName: "AuthorizableCounterChaincode",
       fcn: "Init",
       args: ['a', '100']
   };
   // where is the chain code, ignored in dev mode
   deployRequest.chaincodePath = "test";

   // Issue the deploy request and listen for events
   var tx = user.deploy(deployRequest);
   tx.on('complete', function(results) {
       // Deploy request completed successfully
       console.log("deploy complete; results: %j",results);
       // Set the testChaincodeID for subsequent tests
       chaincodeID = results.chaincodeID;
       invoke(user);
   });
   tx.on('error', function(error) {
       console.log("Failed to deploy chaincode: request=%j, error=%k",deployRequest,error);
       process.exit(1);
   });

}