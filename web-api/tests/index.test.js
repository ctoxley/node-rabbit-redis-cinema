
jest.mock('express')
jest.mock('../src/dispatcher', () => jest.fn())
jest.mock('uuid/v1')

const mockDispatcher = require('../src/dispatcher')
const mockExpress = require('express')
const mockUuid = require('uuid/v1')
const ticket = {
  film: 'Jaws',
  price: 1000,
  location: 'leeds'
}
const mockApp = jest.fn()
const mockRequest = jest.fn()
const mockResponse = jest.fn()
let getId
let postId
mockExpress.json = () => 'json'
mockExpress.mockReturnValue(mockApp)
mockUuid.mockReturnValue('uuid')
mockApp.use = jest.fn()
mockApp.listen = jest.fn()
mockResponse.json = jest.fn()
mockRequest.body = ticket
mockApp.get = jest.fn((id, handler) => {
  getId = id
  handler(mockRequest, mockResponse)
})
mockApp.post = jest.fn((id, handler) => {
  postId = id
  handler(mockRequest, mockResponse)
})
mockDispatcher.isConnected = () => true
mockDispatcher.dispatch = (ticket) => Promise.resolve(ticket)

require('../src/index')

test('Post ticket', () => {
  expect(postId).toBe('/tickets')
  expect(mockResponse.json).toBeCalledWith({ status: 'captured', trackingId: 'uuid' })
})

test('Get health', () => {
  expect(getId).toBe('/health')
  expect(mockResponse.json).toBeCalledWith({ status: 'up' })
})

test('App listening', () => {
  expect(mockApp.listen).toBeCalledWith(3001, expect.anything())
})

test('Express using json', () => {
  expect(mockApp.use).toBeCalledWith('json')
})
