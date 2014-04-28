var ChatView = Backbone.View.extend(
{
	// Default attributes for the view.
	defaults:
	{
		template: 'script#chat-template'
	},

	// DOM events we want to listen for.
	events: 
	{
		'click .submit-message-container .submit' : 'onMessageSubmit',
		'click .notification .close'              : 'removeNotification',
		'keyup input[name=message]'               : 'onInputKeyup'
	},		

	// Called when the view is instantiated.
	initialize: function(options)
	{
		// Replace defaults with any passed in options.
		this.options = _.extend(options, this.defaults);

		// Global event listeners.
		this.listenTo(Backbone, 'chat:loaded', this.onChatLoaded);
		this.listenTo(Backbone, 'chat:inserted', this.onChatInserted);
		this.listenTo(Backbone, 'chat:addInserted', this.onAddChatInserted);

		// Define the collection.
		this.collection = new ChatCollection();

		// Call function to load the template.
		app.requireTemplate(this.options.template.replace('script#', ''));
	},

	// Render the view to the DOM.
	render: function()
	{
		// Assign view scope.
		var $this = this;

		// Identify number of messages.
		var numMessages = this.collection.where({ notification: undefined }).length;
		var numNotifications = this.collection.where({ user: undefined  }).length;

		// Populate template with data.
		var tpl = _.template($(this.options.template).html(), { messages: this.collection.toJSON(), numMessages: numMessages } );

		// Render the view by populating view's DOM element with the template and display element.
		this.$el.html(tpl)
		
		setTimeout(function()
		{
			$this.$el.slideDown();        
		}, 200);		

		// If there are any notifications.
		if (numNotifications > 0)
		{			
			// Set a timeout to remove all notifications.
			setTimeout(function()
			{
				// Loop each notification element.
				$this.$el.find('.notification').each(function()
				{
					// Get the collection ID.
					var id = $(this).find('.close').data('cid');
					// Remove from collection.
					$this.collection.remove(id);				
					// Hide the element then remove it.	
					$(this).slideUp(function(){ $(this).remove(); }); 
				});
			}, 5000);
		}
		// END if notifications.

		app.log('ChatView', 'viewRender');
	},

	// Call server to get chat messages.
	getChatMessages: function()
	{
		// Send request through socket, passing the ID.
		app.nodeSocket.emit('chat:get', { gameRef: this.options.gameRef, user: app.userId });	
	},

	// Respond to when chat messages have been loaded.
	onChatLoaded: function(messages)
	{
		// Set the view's collection to the new messages.
		this.collection.reset(messages);
		// Call function to render view.
		this.render();
	},

	// Check if enter key was pressed on keyup event.
	onInputKeyup: function(e)
	{
		// If the key was enter key.
	    if (e.keyCode == 13) 
	    {
	    	// Call function to send message.
	    	this.onMessageSubmit();
	    }
	},

	// Respond to a user message submit request.
	onMessageSubmit: function()
	{
		// Get the input.
		var $input = this.$el.find('.submit-message-container input[name=message]');
		// Validate the input.
		app.validateInput($input);	

		// If there is an error with the input.	
		if (!$input.parent().hasClass('has-error'))
		{	
			// Create object and populate with data.
			var obj = 
			{
				gameRef: this.options.gameRef, 
				message: $input.val(), 
				user: app.userId			
			}			
			// Set the current message object.
			this.currentMessageObject = obj;
			// Send request through socket, passing the ID and message.
			app.nodeSocket.emit('chat:submit', obj);	
		}
	},

	// Add message to collection and re-render.
	onChatInserted: function(message)
	{
		// Add object as model to collection.
		this.collection.add(message);

		// Render view/
		this.render();
	},	

	// Add message to collection and re-render.
	onAddChatInserted: function()
	{
		// Add object as model to collection.
		this.collection.add(this.currentMessageObject);

		// Render view.
		this.render();

		// Unset the variable.
		this.currentMessageObject = undefined;
	},	

	// Remove the notification, relative to the clicked close button.
	removeNotification: function(e)
	{
		// Get the element and ID.
		var el = $(e.currentTarget);
		var id = el.data('cid');

		// Remove the DOM element.
		el.closest('.notification').slideUp(function(){ $(this).remove() });

		// Remove from collection.
		this.collection.remove(id);
	},

	// Close the chat view, send request to server to remove user from chat.
	close: function()
	{
		// Send request through socket, passing the ID.
		app.nodeSocket.emit('chat:leave', { gameRef: this.options.gameRef, user: app.userId });			
		this.remove();
		this.unbind();		
	}
});
