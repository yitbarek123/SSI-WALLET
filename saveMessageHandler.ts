import { IAgentContext, IDataStore } from '@veramo/core-types'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
// import Debug from 'debug'
// const debug = Debug('veramo:did-comm:message-handler')

type IContext = IAgentContext<IDataStore>



/**
 * A plugin for the {@link @veramo/message-handler#MessageHandler} that decrypts DIDComm messages.
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class SaveMessageHandler extends AbstractMessageHandler {
  /**
   * Handles a new packed DIDCommV2 Message (also Alpha support but soon deprecated).
   * - Tests whether raw message is a DIDCommV2 message
   * - Unpacks raw message (JWM/JWE/JWS, or plain JSON).
   * -
   */
  async handle(message: Message, context: IContext): Promise<Message> {
    //console.log('message received: ', message)
    console.log('message raw: ', message.raw)
    let obj = JSON.parse(message.raw);
    let obj2 = obj.recipients[0]
    //console.log("receipents peer:did: ", obj2.header.kid)

    const m1: IMessage = {
      id: 'm1',
      from: obj2.header.kid,
      to: 'did2',
      createdAt: '2020-06-16T11:06:51.680Z',
      type: 'mock',
      raw: 'mock',
      credentials: '',
      presentations: '',
    }
    //if (message.type === 'veramo.io-chat-v1') {
    const t=  await context.agent.dataStoreSaveMessage({ message: m1 })
    //}

    //console.log(t)

    const t2=  await context.agent.dataStoreGetMessage({  })
    //console.log(t2)
    return super.handle(message, context)
  }
}