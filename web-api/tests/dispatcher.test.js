
jest.mock('amqp-connection-manager')
jest.spyOn(console, 'info')
jest.spyOn(console, 'warn')

const mockAmqp = require('amqp-connection-manager')

let capturedOnCallbacks = []
let capturedChannelOptions
const ticket = {
  film: 'Jaws',
  price: 1000,
  location: 'leeds'
}
const mockConnection = jest.fn()
const mockChannel = jest.fn()
const mockChannelWrapper = jest.fn()
mockConnection.on = jest.fn((event, callback) => capturedOnCallbacks.push(callback))
mockAmqp.connect = jest.fn((connectionStrArr) => mockConnection)
mockConnection.createChannel = jest.fn((channelOptions) => {
  capturedChannelOptions = channelOptions
  return mockChannelWrapper
})
mockChannel.assertQueue = jest.fn()

const dispatcher = require('../src/dispatcher')

test('Message dispatched with error', async () => {
  mockConnection.isConnected = true
  mockChannelWrapper.sendToQueue = jest.fn((queue, message) => Promise.reject(new Error('Test')))
  await dispatcher.dispatch(ticket).catch((err) => expect(err.message).toBe('Service unable to process ticket.'))
})

test('Message dispatched ', async () => {
  mockConnection.isConnected = true
  mockChannelWrapper.sendToQueue = jest.fn((queue, message) => Promise.resolve(message))
  await dispatcher.dispatch(ticket).then((message) => expect(message).toBe(ticket))
})

test('Nothing dispatched ', async () => {
  mockConnection.isConnected = false
  await dispatcher.dispatch(ticket).catch((err) => expect(err.message).toBe('Service unable to process ticket.'))
})

test('Channel created setup', () => {
  expect(capturedChannelOptions.setup(mockChannel)).toBe(mockChannel)
  expect(mockChannel.assertQueue).toBeCalledWith('leeds', { durable: false })
  expect(mockChannel.assertQueue).toBeCalledWith('windermere', { durable: false })
  expect(mockChannel.assertQueue).toBeCalledWith('ulverston', { durable: false })
})

test('Channel created', () => {
  expect(mockConnection.createChannel).toBeCalledWith({ json: true, setup: expect.anything() })
})

test('Is connected asks connection', () => {
  mockConnection.isConnected = true
  expect(dispatcher.isConnected()).toBe(true)
})

test('On disconnected log', () => {
  capturedOnCallbacks[1](new Error('Test'))
  expect(console.warn).toBeCalledWith(`WEB-API - Disconnected from RabbitMq! Err[Test].`)
})

test('On disconnected to RabbitMq', () => {
  expect(mockConnection.on).toBeCalledWith('disconnect', expect.anything())
})

test('On connected log', () => {
  capturedOnCallbacks[0]()
  expect(console.info).toBeCalledWith('WEB-API - Connected to RabbitMq!')
})

test('On connected to RabbitMq', () => {
  expect(mockConnection.on).toBeCalledWith('connect', expect.anything())
})

test('Connection to RabbitMq', () => {
  expect(mockAmqp.connect).toBeCalledWith(['amqp://rabbitmq:rabbitmq@rabbitmq:5672'])
})
