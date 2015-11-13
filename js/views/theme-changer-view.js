/*----- Template Demo Specific ------*/

var ThemeChangerView = Backbone.View.extend({
  // Default attributes for the view.
  defaults: {
    template: 'script#theme-changer-template'
  },

  // DOM events we want to listen for.
  // Attribute key is the event and the value is the function that will be called.
  events: {
    'click .change-theme': 'changeTheme'
  },

  // Called when the view is instantiated.
  initialize: function(options) {
    // Replace defaults with any passed in options.
    this.options = _.extend(options, this.defaults);

    // Call function to load the template. Use replace to get rid of
    // script# since function needs the filename.
    app.requireTemplate(this.options.template.replace('script#', ''));
  },

  // Render the view to the DOM.
  render: function() {
    // Use underscore function to get the HTML of the template
    // and populate it with data from the view's collection.
    // Notice that we need to include collection in an object.
    // If it was a model we would simply use this.model.toJSON()
    // not { this.model.toJSON() }.
    var tpl = _.template($(this.options.template).html(), {
      themes: this.collection.toJSON()
    });

    // Render the view by populating view's DOM element with the template.
    this.$el.html(tpl);

    app.log('ThemeChangerView', 'viewRendered');
  },

  // Respond to event.
  changeTheme: function(e) {
    // Get the element that was clicked.
    var el = $(e.currentTarget);
    // Get the name of the theme.
    var theme = el.html();

    // #stylesheet has been assigned to stylesheet link. Change it's href to change css.
    $('#stylesheet').attr('href', '/assets/bootstrap/css/bootstrap.' + theme + '.css');

  }
});

/*----------------------------------*/
