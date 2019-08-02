
jest.mock('redis', () => jest.fn())
jest.spyOn(console, 'info')
jest.spyOn(console, 'warn')

const mockRedis = require('redis')

let capturedOnCallbacks = []
const ticket = {
  film: 'Jaws',
  price: 1000,
  location: 'leeds',
  trackingId: 'trackingId1'
}
const mockClient = jest.fn()
mockRedis.createClient = jest.fn((port, host) => mockClient)
mockClient.on = jest.fn((event, callback) => capturedOnCallbacks.push(callback))
mockClient.hset = jest.fn()

const persister = require('../src/persister')

test('Hset used by store', () => {
  persister.storeTicket(ticket)
  expect(mockClient.hset).toBeCalledWith(`ticket:${ticket.trackingId}`, 'film', ticket.film, 'price', ticket.price, 'location', ticket.location)
})

test('On disconnected log', () => {
  capturedOnCallbacks[1](new Error('Test'))
  expect(console.warn).toBeCalledWith(`TICKET-PERSISTER - Disconnected from Redis! Err[{}].`)
})

test('On disconnected to Redis', () => {
  expect(mockClient.on).toBeCalledWith('error', expect.anything())
})

test('On connected log', () => {
  capturedOnCallbacks[0]()
  expect(console.info).toBeCalledWith('TICKET-PERSISTER - Connected to Redis!')
})

test('On connected to Redis', () => {
  expect(mockClient.on).toBeCalledWith('connect', expect.anything())
})

test('Connection to Redis', () => {
  expect(mockRedis.createClient).toBeCalledWith(6379, 'redis')
})
