
process.env.EXPRESS_PORT = 80
process.env.CINEMA_LOCATION = 'cinemaLocation'

jest.mock('express')
jest.mock('../src/consumer', () => jest.fn())
jest.mock('../src/persister', () => jest.fn())

const mockConsumer = require('../src/consumer')
const mockPersister = require('../src/persister')
const mockExpress = require('express')
const mockApp = jest.fn()
const mockRequest = jest.fn()
const mockResponse = jest.fn()
const ticket = {
  film: 'Jaws',
  price: 1000,
  location: 'leeds',
  trackingId: 'trackingId1'
}
let getId
mockExpress.json = () => 'json'
mockExpress.mockReturnValue(mockApp)
mockApp.use = jest.fn()
mockApp.listen = jest.fn()
mockResponse.json = jest.fn()
mockRequest.body = ticket
mockApp.get = jest.fn((id, handler) => {
  getId = id
  handler(mockRequest, mockResponse)
})
mockConsumer.isConnected = () => true
mockConsumer.startConsumingFor = jest.fn((queueName, messageHandler) => {
  const result = messageHandler(ticket)
  expect(result).toBeTruthy()
})
mockPersister.storeTicket = jest.fn()

require('../src/index')

test('Get health', () => {
  expect(getId).toBe('/health')
  expect(mockResponse.json).toBeCalledWith({ status: 'up' })
})

test('App listening', () => {
  expect(mockApp.listen).toBeCalledWith('80', expect.anything())
})

test('Express using json', () => {
  expect(mockApp.use).toBeCalledWith('json')
})

test('Queue consumered', () => {
  expect(mockConsumer.startConsumingFor).toBeCalledWith('cinemaLocation', expect.anything())
})

test('Ticket persisted', () => {
  expect(mockPersister.storeTicket).toBeCalledWith(ticket)
})
