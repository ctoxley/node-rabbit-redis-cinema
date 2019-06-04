
const amqp = require('amqp-connection-manager')

const onFailureError = new Error('Service unable to process ticket.')
const connection = amqp.connect(['amqp://rabbitmq:rabbitmq@rabbitmq:5672'])

connection.on('connect', () => console.info('WEB-API - Connected to RabbitMq!'))
connection.on('disconnect', (err) => console.warn(`WEB-API - Disconnected from RabbitMq! Err[${err.message}].`))

const isConnected = () => connection.isConnected()

const channelWrapper = connection.createChannel({
  json: true,
  setup: (channel) => {
    console.info('WEB-API - Asserting location queues.')
    const knownLocations = ['leeds', 'windermere', 'ulverston']
    knownLocations.forEach(location => channel.assertQueue(location, { durable: false }))
    return channel
  }
})

const onDispatchSuccess = (ticket) => () => {
  console.info(`WEB API - SUCCESS - Dispatched ticket[${JSON.stringify(ticket)}].`)
  return Promise.resolve(ticket)
}

const onDispatchFailure = (ticket) => (err) => {
  console.error(`WEB API - FAIL - Unable ticket[${JSON.stringify(ticket)}]. Err[${err.message}].`)
  return Promise.reject(onFailureError)
}

const dispatch = (ticket) => {
  if (isConnected() === false) { return Promise.reject(onFailureError) }

  const json = JSON.stringify(ticket)
  return channelWrapper.sendToQueue(ticket.location, json)
    .then(onDispatchSuccess(ticket))
    .catch(onDispatchFailure(ticket))
}

module.exports = { dispatch, isConnected }
