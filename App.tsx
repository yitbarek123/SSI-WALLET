// shims
import '@sinonjs/text-encoding'
import 'react-native-get-random-values'
import '@ethersproject/shims'
import 'cross-fetch/polyfill'
// filename: App.tsx

// ... shims
import { v4 } from 'uuid'

import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, View, Text, Button,Modal, TextInput,StyleSheet } from 'react-native'

// Import the agent from our earlier setup
import { agent } from './setup'
// import some data types:
import { DIDResolutionResult, IIdentifier, VerifiableCredential, VerifiablePresentation } from '@veramo/core'

import { IVerifyResult } from '@veramo/core'

import { IDIDCommMessage } from '@veramo/did-comm'

import { SelectList } from 'react-native-dropdown-select-list'




const App = () => {
  const [identifiers, setIdentifiers] = useState<IIdentifier[]>([])
  const [resolutionResult, setResolutionResult] = useState<DIDResolutionResult | undefined>()

  const [modalDIDVisible, setModalDIDVisible] = useState(false);

  const [modalVCVisible, setModalVCVisible] = useState(false);

  const [modalVPVisible, setModalVPVisible] = useState(false);

  const [selected, setSelected] = React.useState("");

  const [selectedVC, setSelectedVC] = React.useState("");

  const [textTag, chooseTag] = React.useState('');

  const [modalMessagesVisible, setModalMessagesVisible] = useState(false);
  const [lastMessage, setLastMessage] = React.useState("");

  const [modalVerifyVisible, setModalVerifyVisible] = useState(false);

  const [VP, setVP] = React.useState('');

  const [verifierDID, setVerifierDID] = React.useState('');

  const didmethods = [
    {key:'1', value:'did:peer', disabled:false},
    {key:'2', value:'did:ethr'},
    {key:'3', value:'did:web'}
  ]

  const dids = [
    {key:'1', value:'did:peer:2.Ez6LScYMSsRyTEHNiiN2uu7JbRvLN7S8CXhcwwXeL8mbQPUDQ.Vz6MktvLmt6uFgcLVtuhmve17GL3WznVGLZm1CJDmJJZPnsZD.SeyJpZCI6IjEyMzQiLCJ0IjoiZG0iLCJzIjoiZGlkOndlYjpkZXYtZGlkY29tbS1tZWRpYXRvci5oZXJva3VhcHAuY29tIiwiZGVzY3JpcHRpb24iOiJhIERJRENvbW0gZW5kcG9pbnQifQ', disabled:false},
    {key:'2', value:'did2'},
    {key:'3', value:'did3'}
  ]

  const vcs = [
    {key:'1', value:'vc1', disabled:false},
    {key:'2', value:'vc2'},
    {key:'3', value:'vc3'}
  ]
  // Resolve a DID
  const resolveDID = async (did: string) => {
    const result = await agent.resolveDid({ didUrl: did })
    console.log(JSON.stringify(result, null, 2))
    setResolutionResult(result)
  }

  const STATUS_REQUEST_MESSAGE_TYPE =
  'https://didcomm.org/messagepickup/3.0/status-request'

  const DELIVERY_REQUEST_MESSAGE_TYPE =
  'https://didcomm.org/messagepickup/3.0/delivery-request'
  const MEDIATE_REQUEST_MESSAGE_TYPE = 'https://didcomm.org/coordinate-mediation/2.0/mediate-request'

  function createStatusRequestMessage(
    recipientDidUrl: string,
    mediatorDidUrl: string,
    ): IDIDCommMessage {
    return {
      id: v4(),
      type: STATUS_REQUEST_MESSAGE_TYPE,
      to: mediatorDidUrl,
      from: recipientDidUrl,
      return_route: 'all',
      body: {},
    }
  }

  function deliveryRequestMessage(
    recipientDidUrl: string,
    mediatorDidUrl: string,
  ): IDIDCommMessage {
    return {
      id: v4(),
      type: DELIVERY_REQUEST_MESSAGE_TYPE,
      to: mediatorDidUrl,
      from: recipientDidUrl,
      return_route: 'all',
      body: { limit: 2 },
    }
  }

  function createMediateRequestMessage(
    recipientDidUrl: string,
    mediatorDidUrl: string,
  ): IDIDCommMessage {
    return {
      type: MEDIATE_REQUEST_MESSAGE_TYPE,
      from: recipientDidUrl,
      to: mediatorDidUrl,
      id: v4(),
      return_route: 'all',
      created_time: (new Date()).toISOString(),
      body: {},
    }
  }

  const mediatorDID = 'did:web:dev-didcomm-mediator.herokuapp.com'


  

  // Add the new identifier to state
  const createIdentifier = async () => {
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


    const requestMediationMessage = createMediateRequestMessage(_id.did, mediatorDID)
    console.log(_id)
    setIdentifiers((s) => s.concat([_id]))
  }

  // Make request for VC
  const requestVc = async () => {
      console.log("university's did: ", selectedVC)
      setModalVCVisible(false)
      const message = {
        type: 'test',
        to: selectedVC,
        from: identifiers[identifiers.length-2].did,
        id: '1250',
        body: { hello: 'world het' },
      }
      sendMessage(selectedVC,message)
  }

  // Make request for VC
  const verifyVP = async () => {
    const message = {
      type: 'test',
      to: verifierDID,
      from: identifiers[identifiers.length-2].did,
      id: '1250',
      body: { hello: VP },
    }
    sendMessage(verifierDID,message)
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

  const [credential, setCredential] = useState<VerifiableCredential | undefined>()

  const [presentation, setPresentation] = useState<VerifiablePresentation | undefined>()




  const createPresentation = async () => {
    if (credential) {
      const verifiablePresentation = await agent.createVerifiablePresentation(
       { 
        presentation: {
          holder: identifiers[0].did,
          verifier: [identifiers[0].did],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          verifiableCredential: [credential],
        },
        //challenge: 'VERAMO',
        // TODO: QueryFailedError: SQLITE_CONSTRAINT: NOT NULL constraint failed: presentation.issuanceDate
        // Currently LD Presentations are NEVER saved. (they have no issuanceDate)
        //save: true,
        proofFormat: 'jwt',
      }
      
      )

    //console.log(VerifiablePresentation)

      setPresentation(verifiablePresentation)
    }
  }

  const [verificationResult, setVerificationResult] = useState<IVerifyResult | undefined>()



  const sendMessage =async (issuerDid,message) => {
    

    const packedMessage = await agent.packDIDCommMessage({
      packing: 'none',
      message,
    })
    const result = await agent.sendDIDCommMessage({
      messageId: '1250',
      packedMessage,
      recipientDidUrl: identifiers[identifiers.length-1].did,
    })
    console.log(result)
  }



  const receivedMessage =async () => {
    

    try{
            const statusMessage = await createStatusRequestMessage(
              identifiers[identifiers.length-1].did,
              mediatorDID)
            
            const packedStatusMessage = await agent.packDIDCommMessage({
              packing: 'none',
              message: statusMessage,
            })

            const result1= await agent.sendDIDCommMessage({
              messageId: statusMessage.id,
              packedMessage: packedStatusMessage,
              recipientDidUrl: mediatorDID,
            })
            console.log("result1: ", result1)

            const deliveryMessage = await deliveryRequestMessage(
              identifiers[identifiers.length-1].did,
              'did:web:dev-didcomm-mediator.herokuapp.com')

            const packedDeliveryMessage = await agent.packDIDCommMessage({
              packing: 'none',
              message: deliveryMessage,
            })
            const result=await agent.sendDIDCommMessage({
              messageId: deliveryMessage.id,
              packedMessage: packedDeliveryMessage,
              recipientDidUrl: 'did:web:dev-didcomm-mediator.herokuapp.com',
            })

  }
  catch(e){

  }
  finally{
    const t3=  await agent.dataStoreGetMessage({ })
    //console.log("recieved", t3)
    setLastMessage(t3)
    console.log("last message",JSON.stringify(lastMessage))
    setModalMessagesVisible(true)
  }
    //console.log(result)

    //console.log(packedStatusMessage)
  }

  const getMessage =async () => {
    

    
    //console.log(packedStatusMessag  e)
  }

  return (
    <SafeAreaView>
      <ScrollView>

        {/* previously added code */}



        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 10 }}>{JSON.stringify(credential, null, 2)}</Text>
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
        visible={modalVCVisible}
        onRequestClose={() => {
          setModalVCVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>

          <SelectList 
                setSelected={(val) => setSelectedVC(val)} 
                data={dids} 
                save="value"
            />

          <TextInput
                  onChangeText={chooseTag}
                  placeholder = "choose a tag                                                                         "
                  
                  value={textTag}
                />
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

          <SelectList 
                setSelected={(val) => setSelected(val)} 
                data={vcs} 
                save="value"
            />

          <TextInput
                  onChangeText={chooseTag}
                  placeholder = "choose a tag                                                                          "
                  
                  value={textTag}
                />
            <Button title="ISSUE" onPress={() => requestVc()} />

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
        visible={modalVerifyVisible}
        onRequestClose={() => {
          setModalVerifyVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20 }}>


          <TextInput
                  onChangeText={setVP}
                  placeholder = "VP to be verified                                                             "
                  value={VP}
                />

          <TextInput
                  onChangeText={setVerifierDID}
                  placeholder = "Verifier DID                                                             "
                  value={verifierDID}
                />
            <Button title="verify" onPress={() => verifyVP()} />

            <Button title="Back" onPress={() => setModalVerifyVisible(false)} />
          </View>
        </View>
      </Modal>

        <Button title={'New DID'} onPress={() => setModalDIDVisible(true)}  />
        <Button title={'Request'} onPress={() => setModalVCVisible(true)}  />
        <Button title={'Present'} onPress={() => setModalVPVisible(true)}  />
        <Button title={'Recieved'} onPress={() => receivedMessage()}  />
        <Button title={'Verify'} onPress={() => setModalVerifyVisible(true)}  />

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