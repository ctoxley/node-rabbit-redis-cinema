
const express = require('express')
const { Right: Success } = require('crocks/Either')
const { Left: Failure } = require('crocks/Either')
const dispatcher = require('./dispatcher')
const validator = require('./validator')
const uuid = require('uuid/v1')

const app = express()
const port = 3001

app.use(express.json())
app.listen(port, () => console.info(`WEB-API - Listening on port[${port}].`))

app.get('/health', (req, res) => {
  const health = dispatcher.isConnected() ? 'up' : 'down'
  res.json({ status: health })
})

app.post('/tickets', (req, res) => {
  const requestTicket = req.body
  requestTicket.trackingId = uuid()

  const failAndReport = (reason) => res.json({ status: 'failed', reason: reason })
  const ticketProcessedSucessfully = () => res.json({ status: 'captured', trackingId: requestTicket.trackingId })
  validator.failureOrTicket(requestTicket).either(
    (failure) => failAndReport(failure),
    (ticket) => dispatcher.dispatch(ticket)
      .then((ticket) => ticketProcessedSucessfully(ticket))
      .catch((err) => failAndReport(err.message))
  )
})
