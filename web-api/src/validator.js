
const { Right: Success } = require('crocks/Either')
const { Left: Failure } = require('crocks/Either')
const ifElse = require('crocks/logic/ifElse')
const hasProps = require('crocks/predicates/hasProp')

const knownLocations = ['leeds', 'windermere', 'ulverston']

const failNoLocation = () => Failure('Invalid location. Location not present.')

const failNoKnownLocation = (ticket) => Failure(`Invalid location. Location[${ticket.location}] is not recognised.`)

const locationKnown = (ticket) => knownLocations.includes(ticket.location)

const failureOrTicket = (ticket) => {
  const noLocationOrTicket = ifElse(hasProps('location'), Success, failNoLocation)
  const unknownLocationOrTicket = ifElse(locationKnown, Success, failNoKnownLocation)
  return noLocationOrTicket(ticket).chain(unknownLocationOrTicket)
}

module.exports = { failureOrTicket }
