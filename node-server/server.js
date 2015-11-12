// server.js
// ========


/*
  Require modules and scripts. Setup variables.
*/

// Require Express, server, sockets, and constants.
var app, io, server;

var constants = require('./config/constants.js');
var chatGroups = {};
var port = 3000;

app = require('express')();

server = require('http').Server(app);

io = require('socket.io')(server);

server.listen(port);

console.log('Listening on port ' + port);

/*********************************************************************
*********************************************************************/


/*
  Handle HTTP Verbs.
*/

// Respond to single game being requested incorrectly (without ID).
app.get('/game', function(req, res)
{
    // Send the response.
    res.send(constants.errorMessages.noIdSupplied);
});
// END app.get('/game').


// Respond to single game being requested.
app.get('/game/:id', function(req, res)
{
    // Variable to hold response.
    var response = undefined;
    // Get the ID from the request.
    var id = +req.params.id;

    // Require the game DB tools script.
    var gameTools = require('./dbCalls/gameCalls.js');
    // Call function to get game.
    var game = gameTools.getGame(id);
    // Set the value of the response depending on if a game has been returned.
    response = (game) ? game : constants.errorMessages.noRowsReturned;

    // Send the response.
    res.send(response);
});
// END app.get('/game/:id').


// Respond to all games being requested.
app.get('/games', function(req, res)
{
    // Variable to hold response.
    var response = undefined;

    // Require the game DB tools script.
    var gameTools = require('./dbCalls/gameCalls.js');
    // Call function to get all games.
    var games = gameTools.getGames();
    // Set the value of the response depending on if any games are returned.
    response = (games) ? games : constants.errorMessages.noRowsReturned;

    // Send the response.
    res.send(response);

});
// END app.get('/games').


// Respond to games being requested by league incorrectly (without league).
app.get('/games/league', function(req, res)
{
    // Send the response.
    res.send(constants.errorMessages.noIdSupplied);
});
// END app.get('/games/league').


// Respond to games being requested by league.
app.get('/games/league/:league', function(req, res)
{
    // Variable to hold response.
    var response = undefined;
    // Get the league from the request.
    var league = req.params.league;

    // Require the game DB tools script.
    var gameTools = require('./dbCalls/gameCalls.js');
    // Call function to get games from league.
    var games = gameTools.getGamesFromLeague(league);
    // Set the value of the response depending on if any games are returned.
    response = (games) ? games : constants.errorMessages.noRowsReturned;

    // Send the response.
    res.send(response);
});


/*********************************************************************
*********************************************************************/

io.on('connection', function (socket)
{
  // Send connection status.
  socket.emit('connectionStatus', { connectionStatus: 'connected' });

  // Listen for games:get socket request.
  socket.on('games:get', function ()
  {
    console.log("GET GAMES");
      // Variable to hold response.
      var response = undefined;

      // Require the game DB tools script.
      var gameTools = require('./dbCalls/gameCalls.js');
      // Call function to get all games.
      gameTools.getGames(socket);
  });
  // END games:get request.

  // Listen for game:get socket request.
  socket.on('game:get', function(data)
  {
      // Get the ID from the request and convert to integer with +.
      var id = data.id;

      // Require the game DB tools script.
      var gameTools = require('./dbCalls/gameCalls.js');
      // Call function to get game.
      gameTools.getGame(socket, id);

  });
  // END game:get request.

  // Listen for game:search socket request.
  socket.on('game:search', function(data)
  {
      // If forceId exists.
      if (data.forceId)
      {
          // Get the ID from the request and convert to integer with +.
          var id = data.query;

          // Require the game DB tools script.
          var gameTools = require('./dbCalls/gameCalls.js');
          // Call function to get game.
          gameTools.getGame(socket, id, true);
      }
      // Otherwise it's just a normal search query.
      else
      {
          // Require the game DB tools script.
          var gameTools = require('./dbCalls/gameCalls.js');
          // Call function to get game.
          gameTools.searchByTeam(socket, data.query);
      }
  });
  // END game:get request.

  // Listen for game:insert socket request.
  socket.on('game:insert', function(data)
  {
      // Require the game DB tools script.
      var gameTools = require('./dbCalls/gameCalls.js');
      // Call function to get game.
      gameTools.insertGame(socket, data);

  });
  // END game:insert request.

  // Listen for game:remove socket request.
  socket.on('game:remove', function(data)
  {
      // Require the game DB tools script.
      var gameTools = require('./dbCalls/gameCalls.js');
      // Call function to remove game.
      gameTools.removeGame(socket, data.id);
  });

  // Listen for chat:get socket request.
  socket.on('chat:get', function(data)
  {
      // If the chat group does not exist, create it.
      if (!chatGroups[data.gameRef]) chatGroups[data.gameRef] = data.gameRef;
      // Join the user with the chat group.
      socket.join(chatGroups[data.gameRef]);

      // Require the chat DB tools script.
      var chatTools = require('./dbCalls/chatCalls.js');
      // Call function to get chat by game.
      chatTools.getChatByGame(socket, data.gameRef);

      // Call function to handle user joining chat.
      chatTools.onUserJoin(socket, data);
  });
  // END getGame request.

  // Listen for chat:submit socket request.
  socket.on('chat:submit', function(data)
  {
      // Require the chat DB tools script.
      var chatTools = require('./dbCalls/chatCalls.js');
      // Call function to insert chat message.
      chatTools.submitChatMessage(socket, data);

  });

  // Listen for chat:leave socket request.
  socket.on('chat:leave', function(data)
  {
      // Remove user from chat group.
      socket.leave(data.gameRef);

      // Require the chat DB tools script.
      var chatTools = require('./dbCalls/chatCalls.js');
      // Call function to handle user leaving chat.
      chatTools.onUserLeave(socket, data);
  });

});
