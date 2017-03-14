# Run the project
This project has been constructed and tested primarily on Windows machines, if another os is preferred, some changes to the following instructions may occur.

 * Install python v2.7
 * Install node.js v6.10.0 LTS
 
 Newer versions were not compatible with hfc, if newer versions of hfc are released one could try newer versions of node.js as well.
 * Install Docker
 If you plan to run on windows, windows 10 is required to run docker due to the presence of hyper-v.
 After installation you must go into settings and share the C: Volume
 * Install Kitematic, you can do this by right-clicking the Docker tray icon, follow instructions.
 This is not a requirement, only a tool to simplify access to container logs and command lines.
 * clone github.com/mrowlie/grupp7.git to C://Users/'your-username'/mytest
 The reason for this is that this folder will become shared with the "webapp" container. More on this later on.
 * open powershell
 * cd path to C://Users/'your-username'/mytest/"diverse annat"
 Go to the folder "diverse annat"
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

