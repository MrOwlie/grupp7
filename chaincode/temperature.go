package main

import "fmt"
//import "errors"
//import strconv
import "github.com/hyperledger/fabric/accesscontrol/impl"
import "github.com/hyperledger/fabric/core/chaincode/shim"
import pb "github.com/hyperledger/fabric/protos/peer"

//Init is called when you first deploy your chaincode. As the name implies, this function should be used to do any initialization your chaincode needs.


type TempChaincode struct {

}

func (t *TempChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
    _, args := stub.GetFunctionAndParameters()
    if len(args) != 0 {
        return shim.Error("Invalid number of arguments, expected 0.")
    }

    return shim.Success(nil)
}


//Invoke is called when you want to call chaincode functions to do real work.
//Invocations will be captured as a transactions, which get grouped into blocks on the chain.
//When you need to update the ledger, you will do so by invoking your chaincode.
//Blocks are added to the chain when this function is called.
func (t *TempChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
    function, _ := stub.GetFunctionAndParameters()
    //handle init function
    if function == "init" {
        fmt.Println("invoke is running init")
        return t.Init(stub)
    }

    //val, err :=
    _, err := impl.NewAccessControlShim(stub).ReadCertAttribute("type")

    if err != nil{
        return shim.Error("Could not read cert attribute type")
    }

    isOk, _ := impl.NewAccessControlShim(stub).VerifyAttribute("type", []byte("sensor")) // Here the ABAC API is called to verify the attribute, just if the value is verified the counter will be incremented.


    //Only proceed if the invoker is of type "sensor".
    if isOk{
        fmt.Println("invoke is running " + function)

        // Handle write function
        if function == "write" {
            return t.write(stub)
        } else {
            return shim.Error("Received unknown function invocation: " + function)
        }
        return shim.Error("invoke did not find func: " + function)
    } else {
        return shim.Error("Authentication failed for invocation.")
    }
    return shim.Success(nil)
}



//This function is used to query the chain code. It redirects the request to a helper function that will handle the specific request.
//Blocks are not added to the chain when this function is called.
func (t *TempChaincode) Query(stub shim.ChaincodeStubInterface) pb.Response {
    function, _ := stub.GetFunctionAndParameters()
    val, err := impl.NewAccessControlShim(stub).ReadCertAttribute("type")
    if err != nil {
        fmt.Printf("Position => %v error %v \n", string(val), err)
    }
    isOk, _ := impl.NewAccessControlShim(stub).VerifyAttribute("type", []byte("3rdParty")) // Here the ABAC API is called to verify the attribute, just if the value is verified the counter will be incremented.

    if isOk {
        fmt.Println("query is running " + function)

        // Handle function
        if function == "read" {                            //read a variable
            return t.read(stub)
        } else {
            return shim.Error("Received unknown function query: " + function)
        }


    } else {
       return shim.Error("Request could not be authenticated")
    }

    return shim.Success(nil)
}



//Runs when a peer deploys their instance of the chaincode
func main() {
  err := shim.Start(new(TempChaincode))
  if (err != nil) {
    fmt.Printf("Error starting temperature chaincode: %s", err)
  }
}


//helper function, writes a value to a key on the chaincode state with PutState(Key, Value)
//takes 2 arguments, Key: SensorID, Value: Permission type
func (t *TempChaincode) write(stub shim.ChaincodeStubInterface) pb.Response {
    _, args := stub.GetFunctionAndParameters()
    var key, value string
    var err error
    fmt.Println("running write()")

    if len(args) != 2 {
        return shim.Error("Incorrect number of arguments. Expecting 2!")
    }

    key = args[0]
    value = args[1]
    err = stub.PutState(key, []byte(value))  //write the variable into the chaincode state
    if err != nil {
        return shim.Error(err.Error())
    }
    return shim.Success(nil)
}

//helper function, reads a value from key with GetState(key)
//takes 1 argument, Key: SensorID
func (t *TempChaincode) read(stub shim.ChaincodeStubInterface) pb.Response {
    _, args := stub.GetFunctionAndParameters()
    var key string

    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting name of the key to query!")
    }

    key = args[0]
    valAsBytes, err := stub.GetState(key)
    if err != nil{
        return shim.Error("Failed to get state for " + key + ".")
    }

    return shim.Success(valAsBytes)

}
