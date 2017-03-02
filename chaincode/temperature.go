//First iteration of temperature chaincode.

package main

import (
	"errors"
	"fmt"
	//"strconv"
	"strings"

	//"github.com/hyperledger/fabric/accesscontrol/impl"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

// TemperatureChaincode
type TemperatureChaincode struct {
}


//This function will be executed by the chaincode when it is first deployed.
//I don't think we need any kind of initialization yet. Therefore we take 0 arguments and return nil, nil if that is the case.
func (t *TemperatureChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	adminCert := args[0]
	fmt.Println("This is the adminCert: " + adminCert)
	//if err != nil {
	//return nil, errors.New("Could not get caller metadata.")
	//}
	if len(adminCert) == 0 {
		fmt.Println("This is the adminCert: " + adminCert)
		return nil, errors.New("Invalid admin certificate, it was empty.")
	}
	stub.PutState("admin", []byte(adminCert))
	stub.PutState(string(adminCert), []byte("{insert:true}{temp:true}"))

	return nil, nil
}

//Called when someone is trying to perform a transaction to change the state.
//When adding a policy to allow queries for temperature data, append ("temperature", true) to the policy JSON.
func (t *TemperatureChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {

	//get adminCert
	callerCert := args[0]
	adminCertRaw, err := stub.GetState("admin")
	if err != nil {
		return nil, errors.New("GetState('admin') returned an error, Invoke call aborted.")
	}
	adminCert := string(adminCertRaw)
	if callerCert != adminCert {
		return nil, errors.New("Caller is not admin. Aborting invoke call.")
	}
	if err != nil {
		return nil, errors.New("Failed checking admin certificate.")
	}
	switch function {
		//This case is executed when the recieved function is removePolicy
  case "removePolicy":
		//The removePolicy function only takes one argument, certificate of the user as a string in arg[1].
  	if len(args) != 2 {
      return nil, errors.New("Wrong number of arguments for function " + function + ", expected 1 but recieved " + string(len(args)) + ".")
    }
		fmt.Println("Deleting policy for user: " + args[1] + ".")
		//Delete the policy for user in argument
    stub.PutState(args[2], nil)
  case "addPolicy":
		if len(args) != 3 {
			return nil, errors.New("Wrong number of arguments for function " + function + ", expected 1 but recieved " + string(len(args)) + ".")
		}
		//addPolicy takes the certificate of the user as a string in arg[1] and the policy as string encoded JSON in arg[2].
		fmt.Println("This is what arg[0] looks like: " + args[1])
		fmt.Println("Inserting new policy")
    err = stub.PutState(args[1], []byte(args[2]))
    if err != nil {
      return nil, errors.New("Error occurred when trying to PutState(" + args[1] + ", " + args[2] + ").")
    }
  default:
    return nil, errors.New("Function: " + function + " was not found.")
	}
	return nil, nil
}

// Query callback representing the query of a chaincode
func (t *TemperatureChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
  //Check arguments
  if len(args) != 1 {
  	return nil, errors.New("Queries does not take any arguments. Recieved " + string(len(args)) + ".")
  }
	callerCert := args[0]

	//The JSON decoding is probably broken, what the fuck is an empty interface and how do I iterate over a string array with one?
	policyRaw, err := stub.GetState(string(callerCert))
	if err != nil {
		return nil, errors.New("GetState('callerCert') returned an error, query call aborted.")
	}
	policy := string(policyRaw)


  switch function {
  case "tempFetch":
		if strings.Contains(policy, "{temp:true}") {
			return []byte("false"), nil
		}
		return []byte("false"), nil

	case "tempInsert":
		if strings.Contains(policy, "{insert:true}") && strings.Contains(policy, "{temp:true}") {
			return []byte("true"), nil
		}
		return []byte("false"), nil


	case "policyFetch":
		return policyRaw, nil

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
