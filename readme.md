# Fitbaw

A basic app demonstrating a back-end implementation of Node.js, Socket.io and MongoDB with a Backbone front-end.

## Project Setup

What you'll need to get the project running

1. >= Python 2.5
2. Node.js
3. Express.js
4. Socket.io
5. MongoDB
6. MongoDB Node.JS Driver

> Note that Node modules must be installed within the  ```/node-server ``` directory.

After module installations the directory of ```/node-server ``` should look like the following:

- __/node-server__
  - __config__
 - __dbCalls__
 - __node_modules__
     - .__bin__
     - .__express__
     - .__mongodb__
     - .__socket.io__
 - package.json
 - server.js

> Folders are in bold.

## Testing

_There are currently no tests for this app._

## Deploying

### How to setup the deployment environment

- You will need to ensure that everything in the "Project Setup" section has been installed then simply copy the directory structure to a server (or local machine for testing).

### How to start the server

- start the application using the command  ```node /node-server/server.js``` . You might want to take a look at [Forever](https://github.com/nodejitsu/forever) for node which ensures a script runs continuously. 

## Troubleshooting & Useful Tools

- The status of the Node socket connection can be seen within the browser console. If connected the following should be logged ```Node Socket Status: connected``` otherwise you will see the following ```ReferenceError: io is not defined```.
