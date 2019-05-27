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
  - Has health check.

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
