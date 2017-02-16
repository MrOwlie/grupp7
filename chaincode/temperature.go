//First iteration of temperature chaincode.

package main

import (
	"errors"
	"fmt"
	"strconv"
    "encoding/json"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// TemperatureChaincode
type TemperatureChaincode struct {
}


//This function will be executed by the chaincode when it is first deployed.
//I don't think we need any kind of initialization yet. Therefore we take 0 arguments and return nil, nil if that is the case.
func (t *TemperatureChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if len(args) != 0 {
		return nil, errors.New("Incorrect number of arguments. Expecting 4")
	}

	return nil, nil
}

//Called when someone is trying to perform a transaction to change the state.
//When adding a policy to allow queries for temperature data, append ("temperature", true) to the policy JSON.
func (t *TemperatureChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
    caller, err := stub.GetCallerMetadata()
    if err != nil {
        return nil, errors.New("Could not fetch caller metadata.")
    }
    fmt.Println(caller)
    if caller == "WebAppAdmin" {
        switch function {
        case "removePolicy":
            if len(args) != 1 {
                return nil, errors.New("Wrong number of arguments for function " + function + ", expected 1 but recieved " + len(args) + ".")
            }
            fmt.Println("Deleting policy for user: " + args[0] + ".")
            return t.delete(stub, args)
        case "addPolicy":
            fmt.Println("Inserting new policy for user: " + arg[0] + ".")
            err = stub.PutState(arg[0], arg[1])
            if err != nil {
                return nil, errors.New("Error occurred when trying to PutState(" + arg[0] + ", " + arg[1] + ").")
            }
        default:
            return nil, errors.New("Function: " + function + " was not found.")
        }
    }

    //should a user ever be able to invoke something on the state???




	return nil, nil
}

// Query callback representing the query of a chaincode
func (t *TemperatureChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
    caller, err := stub.GetCallerMetadata()

    if len(args != 0) {
        return nil, errors.New("Queries does not take any arguments. Recieved " + len(args) + ".")
    }

    policyString, err := stub.GetState(caller)
    policy map[string]interface{}
    policy, err := json.Unmarshal(policyString)

    switch function {
    case "temperature":
        if policy[temperature] == true {
            return []byte(true), errors.New("")
        }
    default:
        return []byte(false), errors.New("Function: " + function + " was not found.")
    }

    return nil, nil
}

func main() {
	err := shim.Start(new(TemperatureChaincode))
	if err != nil {
		fmt.Printf("Error starting Temperature chaincode: %s", err)
	}
}
