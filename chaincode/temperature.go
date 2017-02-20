//First iteration of temperature chaincode.

package main

import (
	"errors"
	"fmt"
	"strconv"
    "encoding/json"

	"github.com/hyperledger/fabric/accesscontrol/impl"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// TemperatureChaincode
type TemperatureChaincode struct {
}


//This function will be executed by the chaincode when it is first deployed.
//I don't think we need any kind of initialization yet. Therefore we take 0 arguments and return nil, nil if that is the case.
func (t *TemperatureChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if len(args) != 1 {
		return nil, errors.New("Incorrect number of arguments. Expecting 1. This argument should be the policy of the admin.")
	}
	policyID, err := impl.NewAccessControlShim(stub).ReadCertAttribute("policyID")
	if err != nil {
		return nil, errors.New("Could not fetch user policyID. Make sure the policyID attribute is set in the user certificate.")
	}
	stub.PutState(policyID, args[0])

	return nil, nil
}

//Called when someone is trying to perform a transaction to change the state.
//When adding a policy to allow queries for temperature data, append ("temperature", true) to the policy JSON.
func (t *TemperatureChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
    policyID, err := impl.NewAccessControlShim(stub).ReadCertAttribute("policyID")
    if err != nil {
        return nil, errors.New("Could not fetch user policyID. Make sure the policyID attribute is set in the user certificate.")
    }

	//Get policy of caller
	policyString, err := stub.GetState(policyID)
	if err != nil {
		return nil, errors.New("Could not fetch user policy from state. Make sure the user has a policy set in the state.")
	}
    fmt.Println(policyString)
	policy map[string]interface{}
    policy, err := json.Unmarshal(policyString)
    if policy.admin == true {
        switch function {

			//This case is executed when the recieved function is removePolicy
        case "removePolicy":
			//The removePolicy function only takes one argument, return an error if there is another amount.
            if len(args) != 1 {
                return nil, errors.New("Wrong number of arguments for function " + function + ", expected 1 but recieved " + len(args) + ".")
            }
            fmt.Println("Deleting policy for user: " + args[0] + ".")
			//Delete the policy for user in argument
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
    //Check arguments
    if len(args != 0) {
        return nil, errors.New("Queries does not take any arguments. Recieved " + len(args) + ".")
    }
	policyID, err := impl.NewAccessControlShim(stub).ReadCertAttribute("policyID")
	if err != nil {
		return nil, errors.New("Could not fetch user policy. Make sure the policy attribute is set in the user certificate.")
	}
	policyString, err := stub.GetState(PolicyID)
    policy map[string]interface{}
    policy, err := json.Unmarshal(policyString)

    switch function {
    case "temperature":
        if policy[temperature] == true {
            return []byte(true), nil
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
