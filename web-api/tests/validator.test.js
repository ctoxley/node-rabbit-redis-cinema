
const Either = require('crocks/Either')

const validator = require('../src/validator')

test('Valid locations', () => {
  const knownLocations = ['leeds', 'windermere', 'ulverston']
  knownLocations.map(location => ({ location })).forEach((ticket) => {
    const eitherErrorOrValidTicket = validator.failureOrTicket(ticket)
    expect(eitherErrorOrValidTicket.equals(Either.Right(ticket))).toBeTruthy()
  })
})

test('Invalid location as location unknown', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({ location: 'unknown' })
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid location. Location[unknown] is not recognised.'))).toBeTruthy()
})

test('Invalid location as location missing', () => {
  const eitherErrorOrValidTicket = validator.failureOrTicket({})
  expect(eitherErrorOrValidTicket.equals(Either.Left('Invalid location. Location not present.'))).toBeTruthy()
})
