FROM hyperledger/fabric-peer:latest
WORKDIR /app
# install the hfc locally for use by the application
RUN npm install hfc
# install mongodb driver for the application
RUN npm install mongodb --save
RUN npm install express
# update the hyperledger source ,for building go files
WORKDIR $GOPATH/src/github.com/hyperledger
RUN rm -rf ./fabric
RUN git clone http://gerrit.hyperledger.org/r/fabric
