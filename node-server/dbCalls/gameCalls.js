// gameCalls.js
// ========

// Require Mongo DB client, the util format object, and constants.
var MongoClient = require('mongodb').MongoClient,
  BSON = require('bson').BSONPure,
  format = require('util').format,
  constants = require('../config/constants.js'),
  config = require('../config/config.js'),
  functions = require('../config/functions.js');

module.exports = {
  /* Name      getGame
   * Purpose    To call the database and retrieve the row with the matching ID.
   * @params    {object}   socket   The web socket object used for submitting response to client.
   *            {int}      id       The id to be used to match the row with.
   *            {boolean}  search   Whether or not the query is a search type.
   * returns    +ve     The retrieved row.
   *            -ve      Error response message.
   */
  getGame: function(socket, id, search) {
    // Define response object.
    var response = undefined;

    // Set the event name based on search existence.
    var eventName = search ? 'getGames:response' : 'getGame:response';

    // Connect to database.
    MongoClient.connect(config.mongoUrl + 'fitbaw', function(err, db) {
      // If there is an error, send error response.
      if (err) {
        // Send response to client that initiated request.
        socket.emit(eventName, constants.errorMessages.databaseConnectError);
      } else {
        // Fetch the games collection.
        var collection = db.collection('games');

        // Convert ID into object id.
        var o_id = new BSON.ObjectID(id);

        // Fire query for all rows.
        collection.findOne({
          _id: o_id
        }, function(err, game) {
          // If theres an error.
          if (err) {
            response = constants.errorMessages.databaseReadError;
          }
          // Otherwise we've got data.
          else {
            // Set the value of the response depending on if any games are returned.
            response = (game) ? game : constants.errorMessages.noRowsReturned;
          }

          // Send response to client that initiated request.
          socket.emit(eventName, response);
        });
        // END query.
      }
    });

  },
  /*********************************************************************
   *********************************************************************/


  /* Name      getGames
   * Purpose    To call the database and retrieve all game rows.
   * @params    {object} socket   The web socket object used for submitting response to client.
   * returns    +ve      The retrieved rows.
   *            -ve      Error response message.
   */
  getGames: function(socket) {
    // Define response object.
    var response = undefined;

    // Connect to database.
    MongoClient.connect(config.mongoUrl + 'fitbaw', function(err, db) {
      // If there is an error, send error response.
      if (err) {
        console.log(err);
        console.log('db error');
        // Send response to client that initiated request.
        socket.emit('getGames:response', constants.errorMessages.databaseConnectError);
      } else {
        console.log('getting games');
        // Fetch the games collection.
        var collection = db.collection('games');

        // Fire query for all rows.
        collection.find().toArray(function(err, games) {
          // If theres an error.
          if (err) {
            response = constants.errorMessages.databaseReadError;
          }
          // Otherwise we have data.
          else {
            // Set the value of the response depending on if any games are returned.
            response = (games) ? games : constants.errorMessages.noRowsReturned;
          }

          // Send response to client that initiated request.
          socket.emit('getGames:response', response);
        });
        // END query.
      }
    });


  },
  /*********************************************************************
   *********************************************************************/

  /* Name      searchByTeam
   * Purpose    To call the database and retrieve all game rows.
   * @params    {object} socket   The web socket object used for submitting response to client.
   *            {string} teamName The string we will query db for.
   * returns    +ve      The retrieved rows.
   *            -ve      Error response message.
   */
  searchByTeam: function(socket, teamName) {
    // Define response object.
    var response = undefined;

    // Connect to database.
    MongoClient.connect(config.mongoUrl + 'fitbaw', function(err, db) {
      // If there is an error, send error response.
      if (err) {
        // Send response to client that initiated request.
        socket.emit('getGames:response', constants.errorMessages.databaseConnectError);
      } else {
        // Fetch the games collection.
        var collection = db.collection('games');

        // Fire query for all rows where home/away team matches regex.
        collection.find({
          $or: [{
            "homeTeam": {
              $regex: teamName,
              $options: 'i'
            }
          }, {
            "awayTeam": {
              $regex: teamName,
              $options: 'i'
            }
          }]
        }, {
          _id: 0
        }).toArray(function(err, games) {
          // If theres an error.
          if (err) {
            response = constants.errorMessages.databaseReadError;
          }
          // Otherwise we've got data.
          else {
            // Set the value of the response depending on if any games are returned.
            response = (games) ? games : constants.errorMessages.noRowsReturned;
          }

          // Send response to client that initiated request.
          socket.emit('getGames:response', response);
        });
        // END query.
      }
    });


  },
  /*********************************************************************
   *********************************************************************/


  /* Name      insertGame
   * Purpose    To insert a document into the database.
   * @params    {object} socket   The web socket object used for submitting response to client.
   *            {object} game   The game to be inserted.
   * returns    +ve      Response stating success.
   *            -ve      Response stating failuer.
   */
  insertGame: function(socket, game) {
    console.log('Adding game: ' + game);

    // Define response object.
    var response = undefined;

    // Connect to database.
    MongoClient.connect(config.mongoUrl + 'fitbaw', function(err, db) {
      // If there is an error, send error response.
      if (err) {
        console.log('Error connecting to database')
          // Send response to client that initiated request.
        socket.emit('game:insertResponse', constants.errorMessages.databaseConnectError);
      } else {
        db.collection('games').insertOne(game, function(err, record) {
          // If there is an error, send error response.
          if (err) {
            console.log('Error inserting game')
            // Send response to client that initiated request.
            socket.emit('game:insertResponse', constants.errorMessages.databaseWriteError);
          }
          // Otherwise the document was inserted.
          else {
            console.log('Game inserted')
              // Set the message to cloned version of contants message.
            var message = functions.clone(constants.messages.databaseWriteSuccess);
            console.log(message)
            console.log(record);
            // Set ID to message.
            message._id = record._id;

            console.log(message.__id);

            // Send response to client that initiated request.
            socket.emit('game:insertResponse', message);
            socket.broadcast.emit('game:inserted', record);
          }
        });
      }
      // END if error.
    });
  },
  /*********************************************************************
   *********************************************************************/

  /* Name      removeGame
   * Purpose    To remove a document from the database.
   * @params    {object} socket   The web socket object used for submitting response to client.
   *            {string}    id    The ID of the document to be removed.
   * returns    +ve      Response stating success.
   *            -ve      Response stating failure.
   */
  removeGame: function(socket, id) {
      console.log('Removing document with ID of ' + id);

      // Define response object.
      var response = undefined;

      // Connect to database.
      MongoClient.connect(config.mongoUrl + 'fitbaw', function(err, db) {
        // If there is an error, send error response.
        if (err) {
          consone.log('Error removing game');
          socket.emit('game:removeResponse', constants.errorMessages.databaseConnectError);
        } else {
          // Convert ID into object id.
          var o_id = new BSON.ObjectID(id);

          db.collection('games').removeOne({
            _id: o_id
          }, function(err, record) {
            // If there is an error, send error response.
            if (err) {
              socket.emit('game:removeResponse', constants.errorMessages.databaseDeleteError);
            }
            // Otherwise the document was inserted.
            else {
              // Send response to client that initiated request.
              socket.emit('game:removeResponse', constants.messages.databaseDeleteSuccess);
              // Create object to broadcast.
              var broadcastObj = {
                _id: id
              };

              // Send message to all connected users.
              socket.broadcast.emit('game:removed', broadcastObj);
            }
          });
        }
        // END if error.
      });
    }
    /*********************************************************************
     *********************************************************************/


};
