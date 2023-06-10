// shims
import '@sinonjs/text-encoding'
import 'react-native-get-random-values'
import '@ethersproject/shims'
import 'cross-fetch/polyfill'
// filename: App.tsx

// ... shims

import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, View, Text, Button,Modal, TextInput,StyleSheet,Alert } from 'react-native'

// Import the agent from our earlier setup
import { agent } from './setup'
// import some data types:
import { IIdentifier, VerifiableCredential, VerifiablePresentation } from '@veramo/core'




import { SelectList } from 'react-native-dropdown-select-list'

import AsyncStorage from '@react-native-async-storage/async-storage';



const App = () => {
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([])

  const [modalDIDVisible, setModalDIDVisible] = useState(false);

  const [modalVCVisible, setModalVCVisible] = useState(false);

  const [modalVPVisible, setModalVPVisible] = useState(false);

  const [modalClaimVisible, setModalClaimVisible] = useState(false);


  const [selected, setSelected] = React.useState("");



  const [modalMessagesVisible, setModalMessagesVisible] = useState(false);
  const [lastMessage, setLastMessage] = React.useState("");
  const [modalVCCurrent,setModalVCCurrent] = useState(false);
  const [modalVCCurrent2,setModalVCCurrent2] = useState(false);

  const [currentVC, setVCCurrent] = React.useState("");

  //const [currentVC2, setVCCurrent2] = React.useState("");
  const [currentVC2, setVCCurrent2] = React.useState([]);

  const [currentID, setID] = React.useState("");

  const [currentVP, setVPCurrent] = React.useState("");

  const [currentClaim, setCurrentClaim] = React.useState([]);
  const [sdrVC, setSdrVC] = React.useState("");


  const [modalVerifyVisible, setModalVerifyVisible] = useState(false);

  const [modalSDRVisible, setModalSDRVisible] = useState(false);

  const mediatorDID = 'did:web:dev-didcomm-mediator.herokuapp.com'





  const didmethods = [
    {key:'1', value:'did:peer', disabled:false},
    {key:'2', value:'did:ethr:goerli'},
    {key:'3', value:'did:web'}
  ]


const saveData = async (data) => {

    try {
      let keys = await AsyncStorage.getAllKeys();
      let filteredKeysVC = keys.filter(key => key.startsWith('vc'));
  

  
  
      let totalVCS= filteredKeysVC.length + 1;
      console.log(filteredKeysVC.length)

      await AsyncStorage.setItem('vc'+totalVCS, JSON.stringify(data));
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };


  const saveDataSdr = async (data) => {

    try {
      let keys = await AsyncStorage.getAllKeys();
      let filteredKeysVC = keys.filter(key => key.startsWith('vc-sdr'));
  

  
  
      let totalVCS= filteredKeysVC.length + 1;
      console.log(filteredKeysVC.length)

      await AsyncStorage.setItem('vc-sdr'+totalVCS, JSON.stringify(data));
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  const saveClaim = async (data) => {

    try {
  
      await AsyncStorage.setItem('claim-'+data, JSON.stringify(data));
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Add the new identifier to state
  const createIdentifier = async () => {
    let keys = await AsyncStorage.getAllKeys();
    let filteredKeysID = keys.filter(key => key.startsWith('id'));
    console.log(selected)
    const _id = await agent.didManagerCreate({
      // alias: 'alice',
      provider: selected,
      options: {
        num_algo: 2,
        service: {
          id: '1234',
          type: 'DIDCommMessaging',
          serviceEndpoint: mediatorDID,
          description: 'a DIDComm endpoint',
        },
      },
    })


    let totalIDS= filteredKeysID.length + 1;
    console.log(filteredKeysID.length)

    await AsyncStorage.setItem('id'+totalIDS, JSON.stringify(_id));

    setIdentifiers((s) => s.concat([_id]))
  }

  // Make request for VC
  const requestVc = async () => {
      console.log("university's did: ", currentID)

      let name="john"
      let degree="masters-degree"
      let age="38"

      console.log(JSON.parse(currentID).did)
      const apiUrl = `http://192.168.0.127:5000/createVC?age=${age}&degree=${degree}&name=${name}&did=${JSON.parse(currentID).did}`
  
      return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // do something with the response data
          console.log(data);
          saveData(data)
        })
        .catch(error => {
          // handle any errors
          console.log(name)
          console.error(error);
        });
  }


  // Check for existing identifers on load and set them to state
  useEffect(() => {
    const getIdentifiers = async () => {
      const _ids = await agent.didManagerFind()
      setIdentifiers(_ids)

      // Inspect the id object in your debug tool
      console.log('_ids:', _ids)
    }

    getIdentifiers()
  }, [])


  const [presentation, setPresentation] = useState<VerifiablePresentation | undefined>()




  const createPresentation = async () => {
    //if (credential) {
      let keys = await AsyncStorage.getAllKeys();
      let filteredKeysVP = keys.filter(key => key.startsWith('vp'));
  
      let totalVPS= filteredKeysVP.length + 1;
      console.log(filteredKeysVP.length)
      const verifiablePresentation = await agent.createVerifiablePresentation(
       { 
        presentation: {
          
            holder: identifiers[0].did,
            verifiableCredential: 
              currentVC2
        
            ,
            type: [
              "VerifiablePresentation"
            ],
            "@context": "https://www.w3.org/2018/credentials/v1",
            verifier: [
              "did:ethr:goerli:0x039f2fe1775bb29c01d92f2366eb5c9ac56106d72c9048e7e12e1b9b5e22e3108b"
            ],
            issuanceDate: "2023-05-17T15:09:33.000Z",
            expirationDate: "2023-08-17T15:09:33.000Z"
          },
          challenge: "string",
          domain: "string",
          proofFormat: "jwt",
          removeOriginalFields: true,
          keyRef: "string",
          fetchRemoteContexts: true,
          additionalProp1: "string",
          additionalProp2: "string",
          additionalProp3: "string"
        }
      
      
      )
    console.log(currentVC2)
    console.log(VerifiablePresentation)

      setPresentation(verifiablePresentation)
      await AsyncStorage.setItem('vp'+totalVPS, JSON.stringify(verifiablePresentation));

    //}
  }


  const createSDR = async (claim,vc) => {  
      const sdrJwt = await agent.createSelectiveDisclosureRequest({
        
          "data": {
            "issuer": identifiers[0].did,
            "subject": "string",
            "replyUrl": "string",
            "tag": "string",
            "claims": [
              claim
            ],
            "credentials": [
              vc
            ]
          }
        
      })

      console.log(sdrJwt)
      const apiUrl = `http://192.168.0.127:5000/createSD?sdrJwt=${sdrJwt}`
  
      return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          // do something with the response data
          console.log(data);
          saveDataSdr(data)
        })
        .catch(error => {
          // handle any errors
          console.error(error);
        });
  }



  

  const  setCurrentVC= async (value) => {

    setVCCurrent(value)
    setModalVCCurrent(true)
  }

  const  setCurrentVC2= async (value) => {
    //setVCCurrent2(value)
    //setModalVCCurrent2(true)
    console.log(value)
    //let myVariable: string;
    //myVariable=value
    //let v:string = myVariable.replace(/"/g, '')
    if (!currentVC2.includes(value)){
      //setCurrentVC2([...currentVC2 ,value])
      setVCCurrent2([...currentVC2 , JSON.parse(value)])
    }
    console.log(currentVC2)
    //setVCCurrent2([])
  }

  const  setCurrentID= async (value) => {
    setID(value)
    //setModalVCCurrent2(true)

  }

  const  setCurrentVP= async (value) => {
    setVPCurrent(value)
    //setModalVCCurrent2(true)

  }

  const  setCurrentClaims= async (value) => {
    let myVariable: string;
    myVariable=value
    let v:string = myVariable.replace(/"/g, '')
    if (!currentClaim.includes(v)){
      setCurrentClaim([...currentClaim ,v])
    }
    console.log(currentClaim)
    
    //setCurrentClaim([])


  }

  const  requestSDR= async () => {
    console.log(currentClaim)
    //console.log(sdrVC)
    const jsonObject = JSON.parse(sdrVC).credentialSubject
    let claim = {}
    //let item=currentClaim[0]
    for(const item of currentClaim){
      Object.entries(jsonObject).forEach(([key, value]) => {
        console.log('"'+key+'"');
        console.log(item==key)
        if(item==key){
          claim[key]=value
          console.log(claim)

        }
        // Output:
        // key1 value1
        // key2 value2
        // key3 value3
      });
  }
    console.log(claim)
    createSDR(claim,sdrVC)
    //setModalVCCurrent2(true)

  }

  const  getSDR= async (value) => {
    setCurrentClaim([])
    setSdrVC(value)
    console.log(JSON.parse(value).credentialSubject)
    const jsonObject = JSON.parse(value).credentialSubject
    Object.entries(jsonObject).forEach(([key, value]) => {
      console.log(key, value);
      saveClaim(key)
      // Output:
      // key1 value1
      // key2 value2
      // key3 value3
    });
    const keys = await AsyncStorage.getAllKeys();


    const filteredKeysID = keys.filter(key => key.startsWith('claim'));
    const dataClaim = await AsyncStorage.multiGet(filteredKeysID);
    setDataClaim(dataClaim);
    
    //setModalVCCurrent2(true)
    setModalClaimVisible(true)

  }
  const  presentations= async () => {
    setVCCurrent2([])
    setModalVPVisible(true)

  }
  const  requestVerification= async () => {
    console.log("VP")
    console.log(currentVP)
    const url = `http://192.168.0.127:5001/verifyVP`


  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(currentVP),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('API request failed');
        }
        return response.json();
      })
      .then(data => {
        Alert.alert(
          'Result',
          data.verified.toString(),
          [
            {
              text: 'OK',
              onPress: () => console.log('OK pressed'),
              style: 'default',
            },
          ],
          { cancelable: true }
        );
        console.log(data);
      })
      .catch(error => {
        console.error(error);
      });



  }



  const [data, setData] = useState([]);

  const [dataID, setDataID] = useState([]);

  const [dataClaim, setDataClaim] = useState([]);
  

  const [dataVC, setDataVC] = useState([]);
  const [dataVP, setDataVP] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
      console.log("yes")
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      //setData(dataVC);

      const filteredKeysID = keys.filter(key => key.startsWith('id'));
      const dataID = await AsyncStorage.multiGet(filteredKeysID);
      setDataID(dataID);
      const filteredKeysVC = keys.filter(key => key.startsWith('vc'));
      const dataVC = await AsyncStorage.multiGet(filteredKeysVC);
      setDataVC(dataVC);

      const filteredKeysVP = keys.filter(key => key.startsWith('vp'));
      const dataVP = await AsyncStorage.multiGet(filteredKeysVP);
      setDataVP(dataVP);
      
    } catch (error) {
      console.log(error);
    }
  };

  const removeClaim = async () => {
    let prefix="claim"
    try {
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter((key) => key.startsWith(prefix));
  
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log('Keys removed successfully:', keysToRemove);
      } else {
        console.log('No keys found with the specified prefix.');
      }
    } catch (error) {
      console.log('Error removing keys:', error);
    }
    setDataClaim([])
    setModalClaimVisible(false)
  };

  return (
    <SafeAreaView>
      <ScrollView>

        {/* previously added code */}


        <View style={{ padding: 20 }}>

        <View>
      {dataVC.map(([key, value]) => (
        <Button title={key} onPress={() => setCurrentVC(value)} >
          {key}: {value}
        </Button>
      ))}
      
    </View>
    <View>
      {dataID.map(([key, value]) => (
        <Button title={key} onPress={() => setCurrentVC(value)} >
          {key}: {value}
        </Button>
      ))}
      
    </View>
    <View>
      {dataVP.map(([key, value]) => (
        <Button title={key} onPress={() => setCurrentVC(value)} >
          {key}: {value}
        </Button>
      ))}
      
    </View>
  </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',flexDirection: "row" }}>

        <Modal
        animationType="slide"
        transparent={true}
        visible={modalDIDVisible}
        onRequestClose={() => {
          setModalDIDVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>

          <SelectList 
                setSelected={(val) => setSelected(val)} 
                data={didmethods} 
                save="value"
            />
            <Button title="Create" onPress={() => createIdentifier()} />

            <Button title="Back" onPress={() => setModalDIDVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalClaimVisible}
        onRequestClose={() => {
          setModalClaimVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>

          <View style={{ padding: 20 }}>

          <View>
          {dataClaim.map(([key, value]) => (
          <Button title={key} onPress={() => setCurrentClaims(value)} >
            {key}: {value}
          </Button>
          ))}
          </View>
          </View>
            <Button title="Request SDR" onPress={() => requestSDR()} />

            <Button title="Back" onPress={() => removeClaim()} />
          </View>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVCVisible}
        onRequestClose={() => {
          setModalVCVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>



            <View style={{ padding: 20 }}>

            <View>
            {dataID.map(([key, value]) => (
            <Button title={key} onPress={() => setCurrentID(value)} >
              {key}: {value}
            </Button>
            ))}
            </View>
            </View>


            <Button title="Request" onPress={() => requestVc()} />

            <Button title="Back" onPress={() => setModalVCVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVPVisible}
        onRequestClose={() => {
          setModalVPVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>



            <View style={{ padding: 20 }}>

            <View>
            {dataVC.map(([key, value]) => (
            <Button title={key} onPress={() => setCurrentVC2(value)} >
              {key}: {value}
            </Button>
            ))}
            </View>
            </View>

            <Button title="Get selected" onPress={() =>     setModalVCCurrent2(true)} />

            <Button title="Create Presentation" onPress={() =>     createPresentation()} />

            <Button title="Back" onPress={() => setModalVPVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalMessagesVisible}
        onRequestClose={() => {
          setModalMessagesVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>



          <View style={{ marginBottom: 50, marginTop: 20 }}>
              
           
            
            <Text selectable={true}>
                  {JSON.stringify(lastMessage)}
            </Text>
          
          </View>

            <Button title="Back" onPress={() => setModalMessagesVisible(false)} />
          </View>
        </View>
      </Modal>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVCCurrent}
        onRequestClose={() => {
          setModalVCCurrent(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>



          <View style={{ marginBottom: 50, marginTop: 20 }}>
              
           
            
            <Text selectable={true}>
                  {JSON.stringify(currentVC)}
            </Text>
          
          </View>

            <Button title="Back" onPress={() => setModalVCCurrent(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVCCurrent2}
        onRequestClose={() => {
          setModalVCCurrent2(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>



          <View style={{ marginBottom: 50, marginTop: 20 }}>
              
           
            
            <Text selectable={true}>
                  {JSON.stringify(currentVC2)}
            </Text>
          
          </View>

            <Button title="Back" onPress={() => setModalVCCurrent2(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVerifyVisible}
        onRequestClose={() => {
          setModalVerifyVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>

            <View style={{ padding: 20 }}>

            <View>
            {dataVP.map(([key, value]) => (
            <Button title={key} onPress={() => setCurrentVP(value)} >
              {key}: {value}
            </Button>
            ))}
            </View>
            </View>


            <Button title="request verification" onPress={() =>    requestVerification()} />
          
            <Button title="Back" onPress={() => setModalVerifyVisible(false)} />
          </View>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSDRVisible}
        onRequestClose={() => {
          setModalSDRVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>

            <View style={{ padding: 20 }}>

            <View>
            {dataVC.map(([key, value]) => (
            <Button title={key} onPress={() => getSDR(value)} >
              {key}: {value}
            </Button>
            ))}
            </View>
            </View>


          
            <Button title="Back" onPress={() => setModalSDRVisible(false)} />
          </View>
        </View>
      </Modal>

        <Button title={'New DID'} onPress={() => setModalDIDVisible(true)}  />
        <Button title={'Request'} onPress={() => setModalVCVisible(true)}  />
        <Button title={'Present'} onPress={() => presentations()}  />
        <Button title={'Verify'} onPress={() => setModalVerifyVisible(true)}  />
        <Button title={'SDR'} onPress={() => setModalSDRVisible(true)}  />

        
        </View>



      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Set the height according to your need
    backgroundColor: 'white', // Set the background color
  },
});

export default App