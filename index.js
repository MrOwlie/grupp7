var http = require('http');
var hfc = require('hfc');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

	// Connection URL
	var url = 'mongodb://localhost:27017/myproject';

	// Use connect method to connect to the server
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  console.log("Connected successfully to database");

	  db.close();
	});
	
startupHyperledger();

var server = http.createServer(function(req, res) {
	
  res.writeHead(200);
  res.end("whatever");
  

  
});
server.listen(8080);

function startupHyperledger(){
	  //get the addresses from the docker-compose environment
var PEER_ADDRESS         = "localhost:7050"; //hämta från config file
var MEMBERSRVC_ADDRESS   = "localhost:7054"; //hämta från config file

// Create a client chain.
// The name can be anything as it is only used internally.
var chain = hfc.newChain("targetChain");
console.log("Successfully created chain");

// Configure the KeyValStore which is used to store sensitive keys
// as so it is important to secure this storage.
// The FileKeyValStore is a simple file-based KeyValStore, but you
// can easily implement your own to store whereever you want.
// To work correctly in a cluster, the file-based KeyValStore must
// either be on a shared file system shared by all members of the cluster
// or you must implement you own KeyValStore which all members of the
// cluster can share.
chain.setKeyValStore( hfc.newFileKeyValStore('/skola/d0020e/tmp/keyValStore') );
console.log("Successfully set KeyValStore");

// Set the URL for membership services
chain.setMemberServicesUrl("grpc://"+MEMBERSRVC_ADDRESS);

// Add at least one peer's URL.  If you add multiple peers, it will failover
// to the 2nd if the 1st fails, to the 3rd if both the 1st and 2nd fails, etc.
chain.addPeer("grpc://"+PEER_ADDRESS);
console.log("Successfully set HyperLedger connections");

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
   
   // Now begin listening for web app requests
   listenForUserRequests();
});
}