// Defines routes for app. 
var AppRouter = Backbone.Router.extend({
    routes: {
        // All games route.
    	"games"                        : "getGames",
        // Game route.
        "game/:id"                     :"getGame",
        // Route with params:
        "market/:id"                      : "getMarket",
        // Route with optional params:
    	"paypalpaymentapproved(/:params)"  : "paypalPaymentApproved",
        // Default route.
        "*actions"                        : "defaultRoute"
    }
});


