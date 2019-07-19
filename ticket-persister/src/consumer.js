
const amqp = require('amqp-connection-manager')

const connection = amqp.connect(['amqp://rabbitmq:rabbitmq@rabbitmq:5672'])

connection.on('connect', () => console.info(`TICKET-PERSISTER - Connected to RabbitMq!`))
connection.on('disconnect', (err) => console.warn(`TICKET-PERSISTER - Disconnected from RabbitMq! Err[${JSON.stringify(err)}].`))

const isConnected = () => connection.isConnected()

const createChannelWrapper = (queueName, onMessage) => connection.createChannel({
  json: true,
  setup: channel => {
    console.info(`TICKET-PERSISTER - Consuming queue[${queueName}].`)
    channel.consume(queueName, onMessage(channel))
    return channel
  }
})

const parseAndAckMessage = messageHandler => channel => data => {
  var message = JSON.parse(data.content.toString())
  console.log(`TICKET-PERSISTER - Message[${JSON.stringify(message)}] recieved.`)
  if (messageHandler(message)) {
    channel.ack(data)
  }
}

const startConsumingFor = (queueName, messageHandler) => {
  createChannelWrapper(queueName, parseAndAckMessage(messageHandler))
}

module.exports = { isConnected, startConsumingFor }
