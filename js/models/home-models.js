/**
 *  Game models and collections
 */

var GameModel = Backbone.Model.extend({
  idAttribute: '_id'
});

var GameCollection = Backbone.Collection.extend({
  model: GameModel,

  urlRoot: app.urls.games,

  url: function() {
    // Define node URL.
    return this.urlRoot;
  }
});

/*********************************************/


/**
 *  Chat models and collections
 */

var ChatModel = Backbone.Model.extend({
  initialize: function() {
    this.set('cid', this.cid);
  }
});

var ChatCollection = Backbone.Collection.extend({
  model: ChatModel
});

/*********************************************/
