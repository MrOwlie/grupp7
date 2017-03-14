# Modules and dependencies versions used
* Python v2.7
* Node.JS v6.10.0 LTS
* Docker v1.13.1
* hfc v0.6.5
* express v4.14.0
* ejs v2.5.5
* MongoDB docker image v3.4
* MongoDB driver v2.2.24
* bson 1.0.4
* Fabric starter kit v0.6 (Docker images of Peer and MemberServices)
* Jquery v3.1.1
* Bootstrap v3.7.7


# Run the project
This project has been constructed and tested primarily on Windows machines, if another os is preferred, some changes to the following instructions may occur.

 * Install python v2.7
 * Install node.js v6.10.0 LTS
 
 Newer versions were not compatible with hfc, if newer versions of hfc are released one could try newer versions of node.js as well.
 * Install Docker
 
 If you plan to run on windows, windows 10 is required to run docker due to the presence of hyper-v.
 After installation you must go into settings and share the C: Volume
 * Install Kitematic
 
 you can do this by right-clicking the Docker tray icon, follow instructions.
 This is not a requirement, only a tool to simplify access to container logs and command lines.
 * clone github.com/mrowlie/grupp7.git to C://Users/'your-username'/mytest
 
 The reason for this is that this folder will become shared with the "webapp" container. More on this later on.
 * open powershell
 * cd path to C://Users/'your-username'/mytest/"diverse annat"
 * docker build -t webapp .
 
 Don't forget the dot. This builds the webapp container
 * docker-compose down
 
 This command stops and removes the containers in the docker-compose file.
 * docker-compose up
 
 This starts all the projects containers. Note that there is a static timed delay between containers so roughly 20 seconds need to be waited until the node.js server is started.
 * Start Kitematic by right-clicking the Docker tray icon.
 * There should be four containers running (green icons).
 * Click on webapp and click "EXEC" button above the log.
 * go build ./src/chaincode/policyKeeper.go
 
 This should build the chaincode written in golang. It is required to build the chaincode from within the container if you are running on a windows machine, otherwise a .exe file is created which is the wrong format. The project should already contain the compiled chaincode to ensure stability in the "webapp" container, but this command must be run when changes to the chaincode are made.
 * open a new "EXEC" window with Kitematic
 * node ./src/index.js //This should start the webapp.
 * Connect to "localhost:8080" using google chrome.
 
 Problems have so far occurred with firefox (IE is instantly assumed beyond saving)

# System breakdown

* "diverse annat"/docker-compose.yml

This file contains info to docker on which containers to start, which options they should have and how they are linked.
Here one can change the variables in peer to change ports, debugging levels, security and so on.
Most importantly is the options for webapp. The port to which webapp is accessed can be changed under "ports" with the format "internal port"/"external port". One can also change the address to the database container or to the fabric containers. If one wish to run a different chaincode two changes here must be made, CORE_CHAINCODE_ID_NAME is set to the chaincode name and the command parameter must have the url to the chaincode in order to start it up. Under the parameter volumes is where you set which folder the project lies in, this shares that folder into the webapp container so the node.js server can be started.

* "diverse annat"/Dockerfile

This file contains instructions on how docker should build the container webapp. It is based on the hyperledger/fabric-peer image to get the required golang sources to compile chaincodes. Later it installs all the required node.js modules since they lay inside the container and not the project folder. If one wants to change/add/remove modules, this is where it is done. Just remember that the webaspp image must be rebuilt for changes to come into affect.

* "diverse annat"/go

Example files on chaincodes using the current libraries and commands available to the current version of peer. This is the biggest source of inspiration on how to program chaincode.

* "diverse annat"/testsensor.html

A dummy sensor used to test the functionality of the system. Simply fires AJAX calls with JQuery towards the webapp.



