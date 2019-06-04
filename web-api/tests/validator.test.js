
const Either = require('crocks/Either')

const validator = require('../src/validator')

test('Invalid price as not a number', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({ location: 'leeds', film: 'film', price: 'noANumber' })
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid price. Price[noANumber] is not a number. Given[{"location":"leeds","film":"film","price":"noANumber"}].'))).toBeTruthy()
})

test('Invalid price as price missing', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({ location: 'leeds', film: 'film' })
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid ticket. Missing price. Mandatory properties are: [location|film|price]. Given[{"location":"leeds","film":"film"}].'))).toBeTruthy()
})

test('Invalid film as film missing', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({ location: 'leeds', price: 1 })
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid ticket. Missing film. Mandatory properties are: [location|film|price]. Given[{"location":"leeds","price":1}].'))).toBeTruthy()
})

test('Valid locations', () => {
  const knownLocations = ['leeds', 'windermere', 'ulverston']
  knownLocations.map(location => ({ location, film: 'film', price: 1 })).forEach((ticket) => {
    const eitherErrorOrValidTicket = validator.failureOrTicket(ticket)
    expect(eitherErrorOrValidTicket.equals(Either.Right(ticket))).toBeTruthy()
  })
})

test('Invalid location as location unknown', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({ location: 'unknown', film: 'film', price: 1 })
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid location. Location[unknown] is not recognised. Must be either [leeds|windermere|ulverston]. Given[{"location":"unknown","film":"film","price":1}].'))).toBeTruthy()
})

test('Invalid location as location missing', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({ film: 'film', price: 1 })
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid ticket. Missing location. Mandatory properties are: [location|film|price]. Given[{"film":"film","price":1}].'))).toBeTruthy()
})
