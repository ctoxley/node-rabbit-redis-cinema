
const amqp = require('amqp-connection-manager')

const connection = amqp.connect(['amqp://rabbitmq:rabbitmq@rabbitmq:5672'])

connection.on('connect', () => console.info(`TICKET-PERSISTER - Connected to RabbitMq!`))
connection.on('disconnect', (err) => console.warn(`TICKET-PERSISTER - Disconnected from RabbitMq! Err[${JSON.stringify(err)}].`))

const isConnected = () => connection.isConnected()

const channelWrapper = connection.createChannel({
  json: true,
  setup: channel => {
    console.info(`TICKET-PERSISTER - Channel created.`)
    return channel
  }
})

const startConsuming = (queueName, onMessage) => {
  channelWrapper.addSetup(channel => {
    return Promise.all([
      channel.assertQueue(queueName, { durable: false }),
      channel.prefetch(1),
      channel.consume(queueName, onMessage)
    ])
  })
}

const parseAndAckMessage = messageHandler => data => {
  const json = data.content.toString()
  console.info(`TICKET-PERSISTER - Message[${json}] recieved.`)
  const obj = JSON.parse(json)
  if (messageHandler(obj)) {
    channelWrapper.ack(data)
  }
}

const startConsumingFor = (queueName, messageHandler) => {
  startConsuming(queueName, parseAndAckMessage(messageHandler))
}

module.exports = { isConnected, startConsumingFor }
