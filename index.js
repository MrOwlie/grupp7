// library for handling sensors
var sensor = require('./sensor');
var express = require('express');
var app = express()
var ejs = require('ejs')
var hfc = require('hfc');
var chain;
var AJAX = require('./ajax');

var bson = require('mongodb/js-bson')

var http = require('http');
var https = require('https');

var database = require('./database');

app.set('view engine', 'ejs');
startupHyperledger();

// app.get('/web', function(req, res){

	// var options = {
    // host: 'peer',
    // port: 7051,
    // path: '/chain',
    // method: 'GET',
	// headers: {
		// 'Host': 'peer:7051'
	// }

// };
	// testing(options, function(){console.log("YAS");});
// });

// function testing(options, onResult)
// {
    // var msg = 'GET /transactions/34543 HTTP/1.1\r\n' +
          // 'User-Agent: node\r\n' +
          // 'Host: www.betfair.com\r\n' +
          // 'Accept: */*\r\n\r\n';

	// var client = new require('net').Socket();
	// client.connect(7051, 'peer', function() {
		// console.log("connected");
		// client.write(msg);
	// });
	// client.on('data', function(chunk) {
		// console.log(JSON.stringify(chunk));
	 // });
// };

app.get('/', function(req, res){
	res.send('Main page');
});

app.get('/submit', function(req, res){
	AJAX.sensorSubmit(chain, database, req, res);
});

app.get('/sensors', function(req, res){
	sensors = database.getSensors();

	var activeTableArray = [];
	var queuedTableArray = [];
	var blockedTableArray = [];

	for (item in sensors) {
		json = bson.deserialize(item)
		jsonObject = JSON.parse(json)
		if (jsonObject.flag == 'active'){
			activeTableArray.push("<tr> <td> " + jsonObject.id + " </td> <td> " + jsonObject.desc + " </td> <td> TempSensor </td> <td> <button class="btn btn-sm btn-danger" type="submit" name="block">Block</button> </td> </tr>")
		}else if(jsonObject.flag == 'queue'){
			queuedTableArray.push("<tr> <td> " + jsonObject.id + " </td> <td> LAST </td> <td> LAST REQUEST </td> <td> <button class="btn btn-sm btn-success" type="submit" name="activate">Block</button> </td> <td> <button class="btn btn-sm btn-danger" type="submit" name="block">Block</button> </td> </tr>")
		}else if(jsonObject.flag == 'blocked'){
			blockedTableArray.push("<tr> <td> " + jsonObject.id + " </td> <td> LAST </td> <td> LAST REQUEST </td> <td> <button class="btn btn-sm btn-success" type="submit" name="activate">Block</button> </td> </tr>")
		}
	}

	res.render('views/test', {
		activeTableArray : activeTableArray,
		queuedTableArray : queuedTableArray,
		blockedTableArray : blockedTableArray
	});



});

app.get('/new', function(req, res){
	res.send('new sensor');
	sensor.newSensor(chain, "test", "temperature");
});

app.get('/test', function(req, res){
	database.insertSensor("aaaa", "1");
	database.setSensorDescription("aaaa", "hej du din fis");
	//userInvoke("test", "auth", "increment", [])
});

app.listen(8080, function(){
	console.log('page requested');
})

function startupHyperledger(){
console.log(" **** starting HFC sample ****");


// get the addresses from the docker-compose environment
var PEER_ADDRESS         = process.env.CORE_PEER_ADDRESS;
var MEMBERSRVC_ADDRESS   = process.env.MEMBERSRVC_ADDRESS;

var chaincodeID;

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
	deploy(webAppAdmin, "temperature", "Init", ['a', '100'], "./chaincode");


   // Now begin listening for web app requests
   //listenForUserRequests();
});
}

// Deploy chaincode
function deploy(user, chaincode, func, depargs, codepath) {
   console.log("deploying chaincode "+ chaincode +"; please wait ...");
   // Construct the deploy request
   var deployRequest = {
       chaincodeName: chaincode,
       fcn: func,
       args: depargs
   };
   // where is the chain code, ignored in dev mode
   deployRequest.chaincodePath = codepath;

   // Issue the deploy request and listen for events
   var tx = user.deploy(deployRequest);
   tx.on('complete', function(results) {
       // Deploy request completed successfully
       console.log("deploy complete; results: %j",results);
       // Set the testChaincodeID for subsequent tests
       chaincodeID = results.chaincodeID;
   });
   tx.on('error', function(error) {
       console.log("Failed to deploy chaincode: request=%j, error=%k",deployRequest,error);
       process.exit(1);
   });

}

function userInvoke(user, chaincode, func, ccargs){
	chain.getMember(user, function(err, member){
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
		 });
		 // Listen for the 'error' event.
		 tx.on('error', function(err) {
			console.log("error on invoke: %j",err);
		 });
	});
}
