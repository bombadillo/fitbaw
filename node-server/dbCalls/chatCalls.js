// gameCalls.js
// ========

// Require Mongo DB client, the util format object, constants, and functions.
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format
	, constants = require('../config/constants.js')
	, config = require('../config/config.js')
	, functions = require('../config/functions.js');

module.exports =
{
	/* Name      getChatByGame
	* Purpose    To call the database and retrieve the rows with the matching gameRef.
	* @params    {object} socket   The web socket object used for submitting response to client.
	* @params    {int}   The id to be used to match the row with.
	* returns    +ve     The retrieved row.
	*            -ve      Error response message.
	*/
	getChatByGame: function (socket, id)
	{
		// Define response object.
		var response = undefined;

		// Connect to database.
        MongoClient.connect(config.mongoUrl +'fitbaw', function(err, db)
        {
        	// If there is an error, send error response.
            if (err)
            {
            	socket.emit('getChat:response', constants.errorMessages.databaseConnectError);
            }
            else
            {
	            // Fetch the games collection.
	            var collection = db.collection('chat');

	            // Fire query for all rows.
				collection.find({ 'gameRef': id }).toArray(function(err, chats)
				{
					// If theres an error.
					if (err)
					{
						response = constants.errorMessages.databaseReadError;
					}
					// Otherwise we've got data.
					else
					{
						// Set the value of the response depending on if any chats are returned.
						response = (chats) ? chats : constants.errorMessages.noRowsReturned;
					}

					// Send the response.
					socket.emit('getChat:response', response);
				});
				// END query.
			}
		});

	},
	/*********************************************************************
	*********************************************************************/

	/* Name      submitChatMessage
	* Purpose    To call the database and insert a chat record.
	* @params    {object}   socket    The web socket object used for submitting response to client.
	*            {object}   message   Object containing the data we'll place into the database.
	* returns    +ve      Response stating success.
	*            -ve      Response stating failuer.
	*/
	submitChatMessage: function (socket, message)
	{
		// Define response object.
		var response = undefined;

		// Connect to database.
        MongoClient.connect(config.mongoUrl +'fitbaw', function(err, db)
        {
        	// If there is an error, send error response.
            if (err)
            {
            	response = constants.errorMessages.databaseConnectError;
            	response.errors = true;

				// Send error message to client.
				socket.emit('chat:insertResponse', response);
            }
            // Otherwise we're connected.
            else
            {
          		db.collection('chat').insertOne(message, function(err, record)
				{
					// If theres an error, send error message.
					if (err)
					{
						// Set response to error message.
						response = constants.errorMessages.databaseWriteError;
					}
					// Otherwise the document was inserted.
					else
					{
						// Set response to success message.
						response = constants.messages.databaseWriteSuccess;
						// Send message to all connected clients that new chat has been inserted, use first index since only one message was added.
						socket.broadcast.to(record.gameRef).emit('chat:inserted', record);
					}

					// Send message to client.
					socket.emit('chat:insertResponse', response);
				});
				// END query.
			}
		});
		// END DB connection.
	},
	/*********************************************************************
	*********************************************************************/

	/* Name      onUserJoin
	* Purpose    To notify users for a specific chat that a user has joined.
	* @params    {object}   socket    The web socket object used for submitting response to client.
	*            {object}   data      Object containing info about user.
	* returns               Sends message to all users in chat group.
	*/
	onUserJoin: function(socket, data)
	{
		// Get the message.
		var message = functions.clone(constants.messages.userJoinChat);
		message.message += data.user + '.';

		// Send message to all connected clients that new chat has been inserted, use first index since only one message was added.
		socket.broadcast.to(data.gameRef).emit('chat:inserted', message);
	},
	/*********************************************************************
	*********************************************************************/

	/* Name      onUserLeave
	* Purpose    To notify users for a specific chat that a user has left.
	* @params    {object}   socket    The web socket object used for submitting response to client.
	*            {object}   data      Object containing info about user.
	* returns              Sends message to all users in chat group.
	*/
	onUserLeave: function(socket, data)
	{
		// Get the message.
		var message = functions.clone(constants.messages.userLeaveChat);
		message.message += data.user + '.';

		// Send message to all connected clients that new chat has been inserted, use first index since only one message was added.
		socket.broadcast.to(data.gameRef).emit('chat:inserted', message);
	}
	/*********************************************************************
	*********************************************************************/
}
