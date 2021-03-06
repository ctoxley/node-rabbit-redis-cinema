
const expressPort = process.env.EXPRESS_PORT
const cinemaLocation = process.env.CINEMA_LOCATION

const express = require('express')
const consumer = require('./consumer')
const persister = require('./persister')

const app = express()
app.use(express.json())
app.listen(expressPort, () => console.info(`TICKET-PERSISTER - Listening on port[${expressPort}].`))

app.get('/health', (req, res) => {
  const health = consumer.isConnected() ? 'up' : 'down'
  res.json({ status: health })
})

const onMessage = (ticket) => {
  persister.storeTicket(ticket)
  return true
}

consumer.startConsumingFor(cinemaLocation, onMessage)
