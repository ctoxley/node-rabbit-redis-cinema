
jest.mock('amqp-connection-manager')
jest.spyOn(console, 'info')
jest.spyOn(console, 'warn')

const mockAmqp = require('amqp-connection-manager')

let capturedOnCallbacks = []
let capturedChannelOptions
const ticket = {
  film: 'Jaws',
  price: 1000,
  location: 'leeds',
  trackingId: 'trackingId1'
}
const mockConnection = jest.fn()
const mockChannel = jest.fn()
const mockChannelWrapper = jest.fn()
const data = { content: JSON.stringify(ticket) }
mockConnection.on = jest.fn((event, callback) => capturedOnCallbacks.push(callback))
mockAmqp.connect = jest.fn((connectionStrArr) => mockConnection)
mockConnection.createChannel = jest.fn((channelOptions) => {
  capturedChannelOptions = channelOptions
  channelOptions.setup(mockChannel)
  return mockChannelWrapper
})
mockConnection.isConnected = () => true
mockChannel.consume = jest.fn((queueName, onMessage) => onMessage(data))
mockChannel.ack = jest.fn()

const consumer = require('../src/consumer')

test('Message handled unsuccessfully', () => {
  consumer.startConsumingFor('queueName', () => false)
  expect(mockChannel.ack).not.toHaveBeenCalled()
})

test('Message handled successfully', () => {
  consumer.startConsumingFor('queueName', (message) => {
    expect(message).toEqual(ticket)
    return true
  })
  expect(mockChannel.ack).toBeCalledWith(data)
})

test('Channel created setup', () => {
  consumer.startConsumingFor('queueName', () => true)
  expect(capturedChannelOptions.setup(mockChannel)).toBe(mockChannel)
  expect(mockChannel.consume).toBeCalledWith('queueName', expect.anything())
})

test('Channel created', () => {
  expect(mockConnection.createChannel).toBeCalledWith({ json: true, setup: expect.anything() })
})

test('Is connected asks connection', () => {
  expect(consumer.isConnected()).toBe(true)
})

test('On disconnected log', () => {
  capturedOnCallbacks[1](new Error('Test'))
  expect(console.warn).toBeCalledWith(`TICKET-PERSISTER - Disconnected from RabbitMq! Err[{}].`)
})

test('On disconnected to RabbitMq', () => {
  expect(mockConnection.on).toBeCalledWith('disconnect', expect.anything())
})

test('On connected log', () => {
  capturedOnCallbacks[0]()
  expect(console.info).toBeCalledWith('TICKET-PERSISTER - Connected to RabbitMq!')
})

test('On connected to RabbitMq', () => {
  expect(mockConnection.on).toBeCalledWith('connect', expect.anything())
})

test('Connection to RabbitMq', () => {
  expect(mockAmqp.connect).toBeCalledWith(['amqp://rabbitmq:rabbitmq@rabbitmq:5672'])
})
