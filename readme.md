# Fitbaw
A basic app demonstrating a back-end implementation of Node.js, Socket.io and MongoDB with a Backbone front-end.

## Project Setup
What you'll need to get the project running
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.org/downloads#production)

## Testing
_There are currently no tests for this app._

## Deploying
### How to start the server
- start the application using the command  `node /node-server/server.js` . You might want to take a look at [Forever](https://github.com/nodejitsu/forever) for node which ensures a script runs continuously.

## Troubleshooting & Useful Tools
- The status of the Node socket connection can be seen within the browser console. If connected the following should be logged `Node Socket Status: connected` otherwise you will see the following `ReferenceError: io is not defined`.
