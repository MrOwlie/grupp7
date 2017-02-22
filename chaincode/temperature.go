//First iteration of temperature chaincode.

package main

import (
	"errors"
	"fmt"
	//"strconv"
  "encoding/json"

	//"github.com/hyperledger/fabric/accesscontrol/impl"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// TemperatureChaincode
type TemperatureChaincode struct {
}


//This function will be executed by the chaincode when it is first deployed.
//I don't think we need any kind of initialization yet. Therefore we take 0 arguments and return nil, nil if that is the case.
func (t *TemperatureChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	adminCert, err := stub.GetCallerMetadata()
	if err != nil {
		return nil, errors.New("Could not get caller metadata.")
	}
	if len(adminCert) == 0 {
		return nil, errors.New("Invalid admin certificate, it was empty.")
	}
	stub.PutState("admin", adminCert)
	stub.PutState(string(adminCert), []byte("{ insert: { allowed: true }, groups: ['temp', 'water'] }"))

	return nil, nil
}

//Called when someone is trying to perform a transaction to change the state.
//When adding a policy to allow queries for temperature data, append ("temperature", true) to the policy JSON.
func (t *TemperatureChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	//get adminCert
	adminCert, err := stub.GetState("admin")

	ok, err := t.isCaller(stub, adminCert)
	if err != nil {
		return nil, errors.New("Failed checking admin certificate.")
	}
	if !ok {
		return nil, errors.New("The caller is not admin")
	}
	switch function {
		//This case is executed when the recieved function is removePolicy
  case "removePolicy":
		//The removePolicy function only takes one argument, certificate of the user as a string in arg[0].
  	if len(args) != 1 {
      return nil, errors.New("Wrong number of arguments for function " + function + ", expected 1 but recieved " + string(len(args)) + ".")
    }
		fmt.Println("Deleting policy for user: " + args[0] + ".")
		//Delete the policy for user in argument
    stub.PutState(args[0], nil)
  case "addPolicy":
		//addPolicy takes the certificate of the user as a string in arg[0] and the policy as string encoded JSON in arg[1].
		fmt.Println("This is what arg[0] looks like: " + args[0])
		fmt.Println("Inserting new policy")
    err = stub.PutState(args[0], []byte(args[1]))
    if err != nil {
      return nil, errors.New("Error occurred when trying to PutState(" + args[0] + ", " + args[1] + ").")
    }
  default:
    return nil, errors.New("Function: " + function + " was not found.")
	}
	return nil, nil
}

// Query callback representing the query of a chaincode
func (t *TemperatureChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  //Check arguments
  if len(args) != 0 {
  	return nil, errors.New("Queries does not take any arguments. Recieved " + string(len(args)) + ".")
  }
	callerCert, err := stub.GetCallerMetadata()
	if err != nil {
		return nil, errors.New("Could not get user certificate.")
	}

	//The JSON decoding is probably broken, what the fuck is an empty interface and how do I iterate over a string array with one?
	encodedData, err := stub.GetState(string(callerCert))
  var mappedValues interface{}
  err = json.Unmarshal(encodedData, &mappedValues)

	policy := mappedValues.(map[string]interface{})


  switch function {
  case "tempFetch":
		for k, v := range policy {
			if k == "groups" {
				for group := range v.([]string) {
					if string(group) == "temp" {
						return []byte("true"), nil
					}
				}
				return []byte("false"), nil
			}
		}
		return []byte("false"), nil

	case "tempInsert":
		permission := false
		for k, v := range policy {
			if k == "groups" && permission == true {
				for group := range v.([]string) {
					if string(group) == "temp" {
						return []byte("true"), nil
					}
				}
				return []byte("false"), nil
			}
			if k == "insertPermission" && v == true {
				permission = true
			}
		}
		return []byte("false"), nil

  default:
    return []byte("false"), errors.New("Function: " + function + " was not found.")
  }

    return nil, nil
}


func (t *TemperatureChaincode) isCaller(stub shim.ChaincodeStubInterface, certificate []byte) (bool, error) {
	fmt.Printf("Check caller...")

	// In order to enforce access control, we require that the
	// metadata contains the signature under the signing key corresponding
	// to the verification key inside certificate of
	// the payload of the transaction (namely, function name and args) and
	// the transaction binding (to avoid copying attacks)

	// Verify \sigma=Sign(certificate.sk, tx.Payload||tx.Binding) against certificate.vk
	// \sigma is in the metadata

	sigma, err := stub.GetCallerMetadata()
	if err != nil {
		return false, errors.New("Failed getting metadata, can't verify caller.")
	}
	payload, err := stub.GetPayload()
	if err != nil {
		return false, errors.New("Failed getting payload, can't verify caller.")
	}
	binding, err := stub.GetBinding()
	if err != nil {
		return false, errors.New("Failed getting binding, can't verify caller.")
	}

	fmt.Printf("passed certificate [% x]", certificate)
	fmt.Printf("passed sigma [% x]", sigma)
	fmt.Printf("passed payload [% x]", payload)
	fmt.Printf("passed binding [% x]", binding)

	ok, err := stub.VerifySignature(
		certificate,
		sigma,
		append(payload, binding...),
	)
	if err != nil {
		fmt.Printf("Failed checking signature [%s], can't verify caller.", err)
		return ok, err
	}
	if !ok {
		fmt.Printf("Invalid signature, can't verify caller.")
	}

	fmt.Printf("Check caller...Verified!")

	return ok, err
}

func main() {
	err := shim.Start(new(TemperatureChaincode))
	if err != nil {
		fmt.Printf("Error starting Temperature chaincode: %s", err)
	}
}
