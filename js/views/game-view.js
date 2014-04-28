var GameView = Backbone.View.extend(
{
	// Default attributes for the view.
	defaults:
	{
		template: 'script#game-template'
	},

	// DOM events we want to listen for.
	events: 
	{
	},		

	// Called when the view is instantiated.
	initialize: function(options)
	{
		// Replace defaults with any passed in options.
		this.options = _.extend(options, this.defaults);

		// Call function to load the template.
		app.requireTemplate(this.options.template.replace('script#', ''));

		// Event listeners.
		this.listenTo(Backbone, 'game:loaded', this.onGameLoaded);

		// Set the view's model.
		this.model = new GameModel();
	},

	// Render the view to the DOM.
	render: function()
	{
		// If the ChatView exists, close it.
		if (this.chatView) this.chatView.close();

		// Populate template with data.
		var tpl = _.template($(this.options.template).html(), this.model.toJSON());

		// Render the view by populating view's DOM element with the template.
		this.$el.html(tpl);

		// Create instance of chat view.
		this.chatView = new ChatView({ el: this.$el.find('.chat-container'), gameRef: this.model.get('_id') });		

		// Call function within chatView to get chats.
		this.chatView.getChatMessages();

		// Make the view's element visible.
		this.$el.slideDown();		

		app.log('GameView', 'viewRender');
	},

	// Fetch the game from the server.
	fetchGame: function(id)
	{
		// Check to ensure ID is not larger than 24 characters.
		if (id.length !== 24)
		{ 
			// Set errors to true.
			this.model.set('errors', true);
			// Call function to render.
			this.render();
		}
		else
		{			
			// Submit socket request for game, passing object containing ID.
			app.nodeSocket.emit('game:get', { id: id, forceId: true });
		}
	},

	// Handle a game being loaded.
	onGameLoaded: function(game)
	{
		// Set the new data to the view's model.
		this.model.set(game);

		// Call function to render view.
		this.render();
	}
});
