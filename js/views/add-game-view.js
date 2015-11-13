var AddGameView = Backbone.View.extend({
  // Default attributes for the view.
  defaults: {
    template: 'script#add-game-template'
  },

  // DOM events we want to listen for.
  events: {
    'click .submit': 'validateForm',
    'blur input.data': 'validateInput'
  },

  // Called when the view is instantiated.
  initialize: function(options) {
    // Replace defaults with any passed in options.
    this.options = _.extend(options, this.defaults);

    // Global event listeners.
    this.listenTo(Backbone, 'game:add', this.render);
    this.listenTo(Backbone, 'game:addInserted', this.onGameInserted);

    // Call function to load the template.
    app.requireTemplate(this.options.template.replace('script#', ''));
  },

  // Render the view to the DOM.
  render: function() {
    // Populate template with data.
    var tpl = $(this.options.template).html();

    // Render the view by populating view's DOM element with the template.
    this.$el.html(tpl);

    // Call bootstrap modal function.
    this.$el.modal();

    app.log('AddGameView', 'viewRendered');
  },

  // Validate an input.
  validateInput: function(e) {
    // Call function to validate input.
    app.validateInput($(e.currentTarget));
  },

  // Validate the form.
  validateForm: function() {
    // Get the form, create object to hold data.
    var form = this.$el.find('form'),
      obj = {};


    // Loop each of the inputs.
    form.find('input.data').each(function() {
      // Assign input object to var.
      var $input = $(this);

      // If the input is a bool type.
      if ($input.data('type') === 'bool') {
        // Check for active state.
        obj[$input.attr('name')] = $input.hasClass('active') ? 1 : 0;
      } else {
        // Call function to validate input.
        app.validateInput($input);

        // Nab the value and add to object.
        obj[$input.attr('name')] = $input.val();
      }
    });
    // END input loop.

    // If there are no errors.
    if (!form.find('.has-error').length) {
      // Set the current add game model.
      app.currentAddGame = obj;
      // Submit socket request to insert new game, passing the data.
      app.nodeSocket.emit('game:insert', obj);
    }
  },

  // Hide the modal when a game has been inserted successfully.
  onGameInserted: function() {
    // Hide the modal.
    this.$el.modal('hide');

    // Display message to user.
    app.displayMessage('#main-message-container', 'The game was added successfully.', 'message-success game add', true);
  }

});
