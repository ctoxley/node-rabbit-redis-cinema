
const { Right: Success } = require('crocks/Either')
const { Left: Failure } = require('crocks/Either')
const ifElse = require('crocks/logic/ifElse')
const isNumber = require('crocks/predicates/isNumber')
const hasProps = require('crocks/predicates/hasProp')

const knownLocations = ['leeds', 'windermere', 'ulverston']
const mandatoryProps = ['location', 'film', 'price']
const locationKnown = (ticket) => knownLocations.includes(ticket.location)

const failMissingProperty = (missingProp) => (ticket) => Failure(`Invalid ticket. Missing ${missingProp}. Mandatory properties are: [${mandatoryProps.join('|')}]. Given[${JSON.stringify(ticket)}].`)
const failNoKnownLocation = (ticket) => Failure(`Invalid location. Location[${ticket.location}] is not recognised. Must be either [${knownLocations.join('|')}]. Given[${JSON.stringify(ticket)}].`)
const failPriceNotANumber = (ticket) => Failure(`Invalid price. Price[${ticket.price}] is not a number. Given[${JSON.stringify(ticket)}].`)

const failureOrTicket = (ticket) => {
  const missingLocationOrTicket = ifElse(hasProps('location'), Success, failMissingProperty('location'))
  const missingFilmOrTicket = ifElse(hasProps('film'), Success, failMissingProperty('film'))
  const missingPriceOrTicket = ifElse(hasProps('price'), Success, failMissingProperty('price'))
  const unknownLocationOrTicket = ifElse(locationKnown, Success, failNoKnownLocation)
  const invalidPriceOrTicket = ifElse((ticket) => isNumber(ticket.price), Success, failPriceNotANumber)

  return missingLocationOrTicket(ticket)
    .chain(missingFilmOrTicket)
    .chain(missingPriceOrTicket)
    .chain(unknownLocationOrTicket)
    .chain(invalidPriceOrTicket)
}

module.exports = { failureOrTicket }
