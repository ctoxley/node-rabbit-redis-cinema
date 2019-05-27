
const express = require('express')
const dispatcher = require('./dispatcher')
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
  dispatcher.dispatch(requestTicket)
    .then((ticket) => res.json({ status: 'captured', trackingId: ticket.trackingId }))
    .catch((err) => res.json({ status: 'failed', reason: err.message }))
})
