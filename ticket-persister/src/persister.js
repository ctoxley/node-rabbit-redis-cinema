
const redis = require('redis')
const client = redis.createClient(6379, 'redis')

client.on('connect', () => console.info(`TICKET-PERSISTER - Connected to Redis!`))
client.on('error', (err) => console.warn(`TICKET-PERSISTER - Disconnected from Redis! Err[${JSON.stringify(err)}].`))

const storeTicket = (ticket) => {
  const key = `ticket:${ticket.trackingId}`
  client.hset(key, 'film', ticket.film, 'price', ticket.price, 'location', ticket.location)
}

module.exports = { storeTicket }
