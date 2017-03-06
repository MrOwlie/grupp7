// library for handling sensors
var sensor = require('./sensor');

//BEGIN--System-libraries-initialization--
var express = require('express');
var app = express()
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//tror inte denna ska användas när vi kör ejs, låter den ligga som kommentar ifall att
//app.use(express.static(__dirname + '/html')); //static path to html files

//static path for static files such as images
app.use(express.static(__dirname + '/public'));

var ejs = require('ejs')
var hfc = require('hfc');
var chain;
var AJAX = require('./ajax');

var bson = require('bson')

var http = require('http');
var https = require('https');

var database = require('./database');

app.set('view engine', 'ejs');
//END--System-libraries-initialization--

//initialize connection to peer
startupHyperledger();



app.post('/submit', function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	AJAX.sensorSubmit(chain, database, req, res);
});
//BEGIN--/(index)--------
app.get('/', function(req, res){
	res.render('home');
});
//END--/(index)--------

//BEGIN--/sensors--------
app.get('/sensors', renderSensorHTML);

app.post('/sensors', function(req, res){
	var ac = req.body.activate;
	var blo = req.body.block;

	if(ac){
		sensor.isEnrolled(chain, ac, function(result){
			if(result){
			//sensor.newSensor(chain, ac, "temperature");
			var a = database.setSensorFlag(ac, 2);
			renderSensorHTML(req, res);
			}
			else{
				res.redirect('sensorSettings?id='+ac);
			}
		});
	}
	else if(blo){
		var b = database.setSensorFlag(blo, 3);
		renderSensorHTML(req, res);
	}

});
function renderSensorHTML(req, res){
	var activeTableArray = [];
  var queuedTableArray = [];
  var blockedTableArray = [];
  database.getSensors(function(docs){

    docs.forEach(function(sens){

      if (sens.flag == 2){
        activeTableArray.push(sens)
      }else if(sens.flag == 1){
        queuedTableArray.push(sens)
      }else if(sens.flag == 3){
        blockedTableArray.push(sens)
      }
    });

    res.render('sensor', {
  		activeTableArray : activeTableArray,
  		queuedTableArray : queuedTableArray,
  		blockedTableArray : blockedTableArray

    });
  });
}
//END--/sensors--------

//BEGIN--/sensorSettings--------
app.get('/sensorSettings', function(req, res){
	if(req.query.id.length > 0){
		sensor.isEnrolled(chain, req.query.id, function(itis){
			database.getSensor(req.query.id, function(doc){
			
				if(itis){
					chain.getMember(req.query.id, function(err, sensor){
						var policyRaw = userQuery(sensor, "temperature", "policy", [sensor.enrollment.cert]);
						var policy = JSON.parse(bin2String(policyRaw));
						
						res.render('sensorsetting', {sensor : req.query.id, description : doc.desc, policies: policy, groups: doc.groups});
					  });

          // chain.getMember("WebAppAdmin", function(err, admin){
            // chain.getMember(req.query.id, function(err, sensor){
              // userInvoke(admin, "temperature", "addPolicy", [admin.enrollment.cert, sensor.enrollment.cert, '{"Insert":true, "Groups":["temp"]}']);
              // setTimeout(function(){
                // var policy = userQuery(sensor, "temperature", "policy", [sensor.enrollment.cert]); //this will return the policy
                // var fetch = userQuery(sensor, "temperature", "fetch", [sensor.enrollment.cert, 'asd']); //This will return 0
                // var insert = userQuery(sensor, "temperature", "insert", [sensor.enrollment.cert]); //this will return 1
                // console.log(bin2String(policy));
                // console.log(fetch);
                // console.log(insert);
              // }, 5000);
            // });
          // });
				}
				else{

					res.render('sensorsetting', {sensor : req.query.id, description : doc.desc, policy_string: false, groups : doc.groups});
				}
			});

		});
	}
});

app.post('/sensorSettings', function(req, res){
	var ac = req.body.activate;
	var blo = req.body.block;
	var desc = req.body.description;
	var sgrps =  (req.body.grps.length > 0 ? JSON.parse(req.body.grps) : new Array());
	var policy = req.body.policy
	
	chain.getMember("WebAppAdmin", function(err, admin){
            chain.getMember(req.query.id, function(err, sensor){
              userInvoke(admin, "temperature", "addPolicy", [admin.enrollment.cert, sensor.enrollment.cert, "{tempInsert:true}{temp:true}"]);
            });
          });
  
  console.log(policy)


	//req.body.policy = JSON string of the entire policy

	if(ac){
			sensor.newSensor(chain, ac, "temperature");
			var b = database.setSensorSettings(ac, desc, sgrps);
			var a = database.setSensorFlag(ac, 2);
  }
	else if(blo){
		var b = database.setSensorFlag(blo, 3);
	}
	res.redirect('sensors');
});
//END--/sensorSettings--------

//BEGIN--/about--------
app.get('/about', function(req, res){
	res.render('about');
});
//END--/about--------

app.get('/addSensor', function(req, res){
  res.render('addsensor');
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

app.post('/ajax/getSensors', function(req, res){
	database.getSensors(function(docs){
		res.end(JSON.stringify(docs));
	});
});

app.post('/ajax/setDescription', function(req, res){
	database.setSensorDescription(req.body.id, req.body.desc, function(){
		res.end('{"response":"success"}');
	});
});

app.post('/ajax/setFlag', function(req, res){
	if(parseInt(req.body.flag) == 2)
		sensor.newSensor(chain, req.body.id, "temperature");
	  database.setSensorFlag(req.body.id, req.body.flag, function(){
		res.end('{"response":"success"}');
	});
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

   database.getSystemKeyVal("deployed", function(docs){
	  if(docs.length != 1 || docs[0].val != "true"){
		  deploy(webAppAdmin, "temperature", "Init", [webAppAdmin.enrollment.cert], "./chaincode");
		  database.setSystemKeyVal("deployed", "true");
	  }
	  else
		  console.log("Chaincode already deployed, moving on....")
   });



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

function userQuery(user, chaincode, func, ccargs){
	chain.getMember(user, function(err, member){
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
      //Return results?
		 });
		 // Listen for the 'error' event.
		 tx.on('error', function(err) {
			console.log("error on query: %j",err);
		 });
	});
}

function string2Bin(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  return result;
}

function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

///////////
//Cleanup//
///////////

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
