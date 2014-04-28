/**
 *  Miscellaneous model, used for any form of request.
 */
var BasicModel = Backbone.Model.extend(
{
    // Base url that will be used for the request.
    urlRoot: '',
    // This function can be used to alter the url such as add parameters for GET requests..
    url: function ()
    {
        return this.get('urlRoot');
    },

    // This function can be used to access the data before the fetch success or error functions are invoked.
    // Useful for performing type conversions, error checking, etc.
    parse: function (data, xhr)
    {
        if (data.errorCode && data.errorCode < 1)
        {
            this.errors = true;
        }

        return data;
    }
});
/*********************************************/