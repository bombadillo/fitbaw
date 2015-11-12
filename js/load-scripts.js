// Function waits for document to fully load.
head.ready(document, function ()
{
    // Array containing all the scripts we want to load.
    var scripts = [
        /* Assets */
        // Bootstrap.
        'assets/bootstrap/js/bootstrap.min.js', 'assets/bootstrap/js/datepicker.bootstrap.js',
        // Backbone.
        'assets/backbone/underscore.min.js', 'assets/backbone/backbone.min.js',
        /* END Assets */

        /* App Code */
        'js/app-router.js', 'js/app.js', 'js/serverGenJs.php',
        // Models.
        'js/models/global-models.js', 'js/models/home-models.js',
        // Controllers.
        'js/controllers/home-controller.js',
        // Views.
        'js/views/games-view.js', 'js/views/add-game-view.js', 'js/views/chat-view.js',
        'js/views/game-view.js',
        // Node.
        'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.7/socket.io.min.js'
    ];

    // Function loads each script in the array and calls the anonymous function on completion.
    head.load(scripts, function ()
    {
        // Call function to start app.
        app.HomeController.start({});
    });
});
