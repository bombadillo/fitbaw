app.HomeController = 
{
	// Models.
	// Controllers.
	// Views.
	gamesView: undefined,
	addGameView: undefined,

	// DOM elements.
	elGamesView: '#games',
	elGameView: '#game',
	elAddGame: '#add-game',

	/* Name      start
	* Purpose   To start the app loading all necessary models, collections, views and any
	*       	other necessary objects.
	*/     	
	start: function() 
	{
		app.log('Home Controller initiated.', 'initiated');

		// Assign controller scope to variable.
	    var $this = this;

	    // Use underscore extend function to assign Backbone events object to controller.
	    _.extend(this, Backbone.Events);  		
	
		// Create views.
		this.gamesView = new GamesView({ el: this.elGamesView });		

		// Generate user ID.
		app.userId = "anon" + Math.floor((Math.random()*1024)+1);

		/* Event Listeners */
		this.listenTo(Backbone, 'game:show', this.onGameShow);
		this.listenTo(Backbone, 'game:addClick', this.onAddGame);
		/* END Event Listeners */


		// Call function to setup node socket listener.
		this.setupNodeSocket();

	    // Call function to setup routes.
	    this.setupRoutes();	

	    /* DOM Event Handlers */

	    // Call function to setup DOM event listeners.
	    app.setupDOMListeners();

		/* END DOM Event Handlers */  
	},

	/*  Name      setupRoutes
	 *  Purpose   To setup all the routes for the app.
	*/     	
	setupRoutes: function()
	{
        // Assign controller scope.
        var $this = this;

 		// Initiate the router
        var app_router = new AppRouter();
     
        // Get game route.
        app_router.on('route:getGame', function(id)
        {
	    	// Hide all elements.
	    	$('.hide-content').slideUp();		

	    	// Set the current route value.
	    	app.currentRoute = 'getGame';

			// If the view does not exist, create instance of it.
			if (!this.gameView) this.gameView = new GameView({ el: $this.elGameView });;

			// Call gameView function to get the game from server.
			this.gameView.fetchGame(id);

        });

        // Get games route.
        app_router.on('route:getGames', function() 
        {   
			// Hide all modals.
			$('.modal').modal('hide');

        	// Set the current route value.
        	app.currentRoute = 'getGames';

        	// Hide all elements.
        	$('.hide-content').slideUp();

	   		// Trigger event to load all games.
	   		Backbone.trigger('games:loadall');

			app.log('Games', 'routeChange');
        });
        // END route.        

        // Default route (Home).
        app_router.on('route:defaultRoute', function() 
        {  
			// Hide all modals.
			$('.modal').modal('hide');

        	// Set the current route value.
        	app.currentRoute = 'default';        	
        	// Hide all elements.
        	$('.hide-content').slideUp();

        	// Show element.
        	$('#home-content').slideDown();

            app.log('Home', 'routeChange');           
        });            

        // Start Backbone history, a necessary step for bookmarkable URL's
        Backbone.history.start();        
	},

	/*  Name      setupNodeSocket
	 *  Purpose   To setup the node socket. This includes invoking the socket and
	 *            creating listeners for various messages.
	*/    
	setupNodeSocket: function()
	{
	    // Create web socket instance.
		app.nodeSocket = io.connect('http://88.208.234.78:3000');

		// Test connection status.
		app.nodeSocket.on('connectionStatus', function (data) 
		{
			app.log('Node Socket Status: '+ data.connectionStatus);
		});		

		// On games request response.		
		app.nodeSocket.on('getGames:response', function (data)
		{
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('games:loaded', data);
		});	

		// On game request response.
		app.nodeSocket.on('getGame:response', function (data)
		{
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			Backbone.trigger('game:loaded', data);
		});

		// On game insert request response.	
		app.nodeSocket.on('game:insertResponse', function (data)
		{						
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('game:addInserted', data);
		});

		// On game inserted by other user.
		app.nodeSocket.on('game:inserted', function (data)
		{
			// If the view is not currently getGames, prevent further execution.
			if (app.currentRoute !== 'getGames') return false;

			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('game:inserted', data);
		});

		// On game remove response.
		app.nodeSocket.on('game:removeResponse', function(data)
		{
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('game:removedResponse', data);
		});

		// On game removed.
		app.nodeSocket.on('game:removed', function(data)
		{
			// If the view is not currently getGames, prevent further execution.
			if (app.currentRoute !== 'getGames') return false;

			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('game:removed', data);
		});		

		// On chat request response.
		app.nodeSocket.on('getChat:response', function(data)
		{
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('chat:loaded', data);		
		});

		// On chat insert response.
		app.nodeSocket.on('chat:insertResponse', function(data)
		{
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('chat:addInserted', data);		
		});

		// On chat insert response.
		app.nodeSocket.on('chat:inserted', function(data)
		{
			// If an error code has been returned.
			data.errors = data.errorCode < 1 ? true : false;

			// Trigger event, passing the data.
			Backbone.trigger('chat:inserted', data);		
		});		
	},

	/*  Name      onAddGame
	 *  Purpose   To check if addGameView has been instantiated.
	 *  Returnes  If the view is not defined it creates the view. 'game:add' event is triggered.
	*/    
	onAddGame: function()
	{
		// If the view does not exist.
		if (!this.addGameView) this.addGameView = new AddGameView({ el: this.elAddGame });			
		
		// Trigger event.
		Backbone.trigger('game:add');
	},

	/*  Name      onGameShow
	 *  Purpose   To check if gameView has been instantiated.
	 *  Returnes  If the view is not defined it creates the view. 'game:show' event is triggered.
	*/   
	onGameShow: function(game)
	{

	}
	
}