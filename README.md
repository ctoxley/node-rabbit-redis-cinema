# node-rabbit-redis-cinema

This is my NodeJS, RabbitMq and Redis playground.

## Flow

```

          /-> leeds queue ------> ticket persister -\
         /                                           \
web-api ----> windermere queue -> ticket persister ----> redis
         \                                           /
          \-> ulverston queue --> ticket persister -/
```

## Microservices

**web-api**:
  - Consumes tickets for cinema.

  POST localhost:3001/tickets

  ContentType: application/json

  ```javascript
  {
    "film": "Jaws",
    "price": 1000,
    "location": "leeds"
  }
  ```
  *film, price and location are mandatory. price is in pence.*

  - Has health check.

  GET localhost:3001/health

  response:
  ```javascript
  {
      "status": "up"
  }
  ```

**rabbitmq**
  - Hosts three queues: leeds, windermere and ulverston.

**tickerPersister**
  - Persists tickets and aggregations.

**redis**
  - Data is store.

## Running Microservices

All microservices have been defined in the docker-compose.yml.

To start use: $ docker-compose up

Please make sure you have built the NodeJS projects before running up the microservices.

## Building NodeJs projects

In each node project.

Build project:

$ npm install

Run tests:

$ npm test

Check coverage:

$ npm run coverage

## RabbitMq management

http://localhost:15672/

## Redis

Read ticket:

$ docker exec -it $1 /bin/bash

$ redis-ci

$ hgetall ticket:trackingId
