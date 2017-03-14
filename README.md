# Run the project
 * Install python v2.7
 * Install node.js v6.10.0 LTS
 * Install Docker
 * Install Kitematic, you can do this by right-clicking the Docker tray icon, follow instructions.
 * clone github.com/mrowlie/grupp7.git
 * open powershell
 * cd \textless Path\textgreater /grupp7/"diverse annat"		//Go to the folder "diverse annat"
 * docker build -t webapp .		//Don't forget the dot. This builds the webapp container
 * docker-compose down		//Just in case something is already running for whatever reason
 * docker-compose up		//This should start all the required docker containers
 * Open C:/Users/\textless username\textgreater /mytest, copy the git repository to this folder.
 * Start Kitematic by right-clicking the Docker tray icon.
 * There should be four containers running (green icons).
 * Click on webapp and click "EXEC" button above the log.
 * go build ./src/chaincode/policyKeeper.go		//This should build the chaincode
 * ./src/chaincode/policyKeeper //This should start the chaincode
 * open a new "EXEC" window with Kitematic
 * node ./src/index.js //This should start the webapp.
 * Connect to "localhost:8080" using google chrome.
