var GamesView = Backbone.View.extend(
{
	// Default attributes for the view.
	defaults:
	{
		template: 'script#games-template'
	},

	// DOM events we want to listen for.
	// Attribute key is the event and the value is the function that will be called.
	events: 
	{
		'submit .search-form' : 'onSearchSubmit',
		'click .reset-search' : 'resetSearch',
		'click .game'         : 'onGameClick',
		'click .delete'       : 'onDelete'
	},		

	// Called when the view is instantiated.
	initialize: function(options)
	{
		// Replace defaults with any passed in options.
		this.options = _.extend(options, this.defaults);

		// Call function to load the template. Use replace to get rid of 
		// script# since function needs the filename.
		app.requireTemplate(this.options.template.replace('script#', ''));

		// Event listeners.
		this.listenTo(Backbone, 'games:loadall', this.fetchGames);
		this.listenTo(Backbone, 'games:loaded', this.onGamesLoaded);
		this.listenTo(Backbone, 'getGames:resize', this.render);
		this.listenTo(Backbone, 'game:inserted', this.onGameInserted);
		this.listenTo(Backbone, 'game:addInserted', this.onAddGameInserted);
		this.listenTo(Backbone, 'game:removed', this.onGameRemoved);
		this.listenTo(Backbone, 'game:removedResponse', this.onGameRemovedResponse);

		// Define the collection.
		this.collection = new GameCollection();
	},

	// Render the view to the DOM.
	render: function()
	{
		// Create template, populating HTML with the data.
		var tpl = _.template($(this.options.template).html(), 
		{ 
			games: this.collection.toJSON(), 
			search: this.search, 
			errors: this.collection.errors 
		});

		// Render the view by populating view's DOM element with the template.
		this.$el.html(tpl);

		// Show the view's element if it is not visible.
		this.$el.slideDown();

		app.log('GamesView', 'viewRender');
	},

	// Fetch the games from the server.
	fetchGames: function()
	{
		// Submit socket request for games.
		app.nodeSocket.emit('games:get');
	},

	// Handle the games data sent by server. 
	onGamesLoaded: function(data)
	{
		// If there is an error code.
		if (data.errors) 
		{			
			this.collection.errors = true;			
		}
		// Otherwise add data to collection.
		else
		{
			this.collection.errors = false;
			this.collection.reset(data);			
		}

		// Call render function.
		this.render();
	},

	// Handle user clicking on game.
	onGameClick: function(e)
	{
		// Get the ID.
		var id = $(e.currentTarget).closest('.game').data('id');

		// Set the window href to the game route with ID.
		window.location.href = '#/game/'+ id;
	},

	// Handle the submission of the search form.
	onSearchSubmit: function(e)
	{
		// Prevent default response.
		e.preventDefault();

		// Object to hold data to be sent to server.
		var obj = {};

		// Get the ID.
		var query = this.$el.find('.search-form input').val();

		// Check to see if the ID has been input.
		if (query.match('id:'))
		{
			// Replace the text in the value so that we're left with ID only.
			query = query.replace('id:', '');
			obj.forceId = true;
		}

		// Set ID to obj.
		obj.query = query;

		// Set the value to true so that we know a search has been committed.
		this.search = true;

		// Send request through socket, passing the ID in an object.
		app.nodeSocket.emit('game:search', obj);		
	},

	// Reset the view by calling server to get all games.
	resetSearch: function()
	{
   		// Trigger event to load all games.
   		Backbone.trigger('games:loadall');

   		// Set the value to false since we are resetting the search.
   		this.search = false;
	},

	// Add game to collection and re-render if the user is not in a search.
	onGameInserted: function(game)
	{
		console.log(game)
		// Add object as model to collection.
		this.collection.add(game);

		// Render view if user is not in search.
		if (!this.search) this.render();
	},

	// Add game to collection and re-render if the user is not in a search.
	onAddGameInserted: function(data)
	{
		// If the view is not currently getGames, prevent further execution.
		if (app.currentRoute !== 'getGames') return false;

		// Set the current game to the ID.
		app.currentAddGame._id = data._id;

		// Add object as model to collection.
		this.collection.add(app.currentAddGame);

		// Render view if user is not in search.
		if (!this.search) this.render();

		// Unset the variable.
		app.currentAddGame = undefined;
	},

	// Send message to server to delete game.
	onDelete: function(e)
	{
		// Prevent event from being propagated.
		e.stopPropagation();
		// Get the ID.
		var id = $(e.currentTarget).closest('.game').data('id');

		// Set the current delete game.
		this.currentDeleteGame = this.collection.get(id);

		// Send request through socket, passing the id in an object.
		app.nodeSocket.emit('game:remove', { id: id });
	},

	// Remove game from collection and re-render when another user removes a game.
	onGameRemoved: function(game)
	{		
		console.log(game)
		// Remove from collection.
		this.collection.remove(game._id);
console.log(this.collection)
		// Render the view if the user is not in search, or if bIsRemover is found.
		if (!this.search) this.render();		
	},

	// Remove game from collection and re-render when current user removes a game.
	onGameRemovedResponse: function(data)
	{
		// Remove from collection.
		this.collection.remove(this.currentDeleteGame.get('_id'));

		// Render view.
		this.render();

		// Set variable back to default.
		this.currentDeleteGame = undefined;

		// Display message to user.
		app.displayMessage('#main-message-container', 'The game was removed successfully.', 'message-success game remove', true);		
	},
});
