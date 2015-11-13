var app = {
  // Global variables.
  urls: {
    games: '/node/games',
    serverSocket: 'http://localhost:3000'
  },
  currentView: undefined,

  bootstrapRowModulus: undefined,
  bootstrapDeviceSize: undefined,

  /*
   * Purpose: To return a string in format YYYY-MM-DD from a Date object
   * Params: oDate
   * Returns: +ve   a string in format YYYY-MM-DD from a Date object
   */
  getCustomDate: function(oDate) {
    var sCustomDate = "";
    if (oDate) {
      var sDays = (oDate.getDate()).toString();
      var sMonth = (oDate.getMonth() + 1).toString();
      var sYear = (oDate.getFullYear()).toString();

      if (sDays.length === 1) {
        sDays = "0" + sDays;
      }

      if (sMonth.length === 1) {
        sMonth = "0" + sMonth;
      }

      sCustomDate = sYear + "-" + sMonth + "-" + sDays
    }
    return sCustomDate;
  },


  /* Name      requireTemplate
   * Purpose   To take in a template name and locate the template within the directory.
   * Params    templateName     The template to be loaded.
   * Returns   +ve     If the template is found, append it to the head of the document.
   */
  requireTemplate: function(templateName) {
    var template = $('#' + templateName);
    if (template.length === 0) {
      var tmpl_dir = 'js/templates/';
      var tmpl_url = tmpl_dir + templateName + '.tmpl';
      var tmpl_string = '';

      $.ajax({
        url: tmpl_url,
        method: 'GET',
        async: false,
        contentType: 'text',
        success: function(data) {
          tmpl_string = data;
        }
      });

      $('head').append('<script id="' +
        templateName + '" type="text/template">' + tmpl_string + '<\/script>');
    }
  },

  /* Name      displayMessage
   * Purpose   To display a message to the user.
   * Params    el         The element that the message is to be prepended to.
   *           message    The message/html that will be inserted into the element.
   *           elClass    The class name that will be added to the created element.
   *           timeout    Boolean. If true, the message will be faded out after a set time.
   * Returns   Prepends the html to the element.
   */
  displayMessage: function(el, message, elClass, timeout) {
    // If the el and message vars are not null or empty.
    if (el !== null && el !== '' && message !== null && message !== '') {
      // Call function to convert elClass into jQuery selector compatible string.
      var errorInstance = app.convertStringToSingleElementClassSelector(elClass);

      // If there are any message instances with the same class, remove them.
      if ($(errorInstance).length > 0) {
        $(errorInstance).remove();
      }

      // Create HTML for message.
      var html = '<div class="row message ' + elClass + '"><div class="col-lg-1 col-md-1 col-sm-1 col-xs-1 status"><i class="ghost success fa fa-check"></i><i class="ghost danger error fa fa-exclamation"></i><i class="ghost info text-info fa fa-info"></i></div><div class="col-lg-11 col-md-11 col-sm-11 col-xs-11 text">' + message + '</div><span class="message-close">&times;</span></div>';

      // Prepend HTML to element and display.
      $(html).hide().prependTo(el).slideDown('fast');

      // If a timeout has been requested.
      if (timeout) {
        // Set timeout.
        window.setTimeout(function() {
          // Hide the message.
          $(errorInstance).slideUp(function() {
            // Remove DOM element.
            $(this).remove();
          });
        }, 7000);
        // END timeout.
      }
      // END if timeout.
    }
    // END if el and message vars exist.
  },

  /* Name      convertStringToSingleElementClassSelector
   * Purpose   To convert a string into a class selector. Can take multiple classes seperated by a space.
   * Params    string     The string to be processed..
   * Returns   The string converted into a class selector.
   */
  convertStringToSingleElementClassSelector: function(string) {
    string = string.replace(/\s\s+/g, ' ');
    string = string.split(' ').join('.');
    if (string[0] !== '.') string = '.' + string;
    return string;
  },

  getAge: function(dateString) {
    var birthday = +new Date(dateString);
    return ~~((Date.now() - birthday) / (31557600000));
  },


  /* Name      isNumber
   * Purpose   To check if variable is a number.
   * Params    n      The variable to check.
   * Returns   +ve    true
   *           -ve    false
   */
  isNumber: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },

  /* Name      enableFixedElement
   * Purpose   Fixes an element to the top of the screen.
   * Params    el              The element to be fixed.
   *           iTop            The number of pixels from the top the element is to be fixed to.
   *           sCallBackEvent  The name of the event to be fired when the element is fixed.
   *           bResetWidth     Boolean to determine if width should be reset on change back to
   *                           static position.
   * Returns   Fixes the element to the top of the page if the element is not fixed. If the element is fixed then
   *           it will be changed to position:static.
   */
  enableFixedElement: function(el, iTop, sFixedCallBackEvent, sStaticCallBackEvent, bResetWidth) {
    var $this = this;

    // Int holding the number pixels the element is from the top.
    var stickyTop = $(el).offset().top;

    // On window scroll event.
    $(window).scroll(function() {

      var windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;

      var marketHeight = $('#market-lines').innerHeight();

      if (windowHeight - marketHeight > 0) return false;

      // Prevent further execution if the browser width is below 759. This is the width that bootstrap takes over for
      // mobile devices.
      if ($(window).width() <= 759) return false;

      if (window.innerWidth < 982) {
        iTop = 0;
      }

      // Int holding the number of pixels to the top the browser scroll is.
      var windowTop = $(window).scrollTop();

      // If the elements position is less than the windows position then make it fixed.
      if (stickyTop < windowTop + iTop) {
        var currWidth = $(el).innerWidth();

        $(el).css({
          position: 'fixed',
          top: iTop + 'px',
          width: currWidth
        });

        // If the param has been passed in, fire event.
        if (sFixedCallBackEvent) Backbone.trigger(sFixedCallBackEvent);
      }
      // Otherwise make it static.
      else {
        $(el).css('position', 'static');

        // If the bool exists, reset the width.
        if (bResetWidth) $(el).css('width', '');

        // If the param has been passed in, fire event.
        if (sStaticCallBackEvent) Backbone.trigger(sStaticCallBackEvent);
      }
    });
    // END
  },

  formatCurrency: function(amount) {
    // returns the amount in the .99 format
    amount -= 0;
    amount = (Math.round(amount * 100)) / 100;
    return (amount == Math.floor(amount)) ? amount : ((amount * 10 == Math.floor(amount * 10)) ? amount + '0' : amount);
  },

  formatNumber: function(value, decimal) {
    value = value - 0; // cast to integer
    if (!decimal) decimal = (value >= 1.05) ? 2 : 3;

    var num = value.toFixed(decimal);
    var tmp = num + '';
    var regexp = (decimal == 3) ? '\.000' : '\.00';
    var reg_match = new RegExp(regexp);

    if (tmp.match(reg_match)) {
      num = value.toFixed(0);
    }
    tmp = num + '';

    reg_match = new RegExp('\\\.'); // silly escaping

    if (tmp.match(reg_match)) {
      var re = new RegExp("0$");
      tmp = tmp.replace(re, "");
      num = tmp - 0;
    }
    return num;
  },

  popup: function(url, name, settings) {
    // this checks if settings have been passed with width/height/etc
    if (settings) {
      var bFixed = true;

      if (settings.indexOf("height=100%") != -1) {
        var iHeight = screen.availHeight * 0.94;
        settings = settings.replace("height=100%", "height=" + iHeight);
      }
    } else {
      var bFixed = false;
      settings = "scrollbars=1,resizable=1,height=600,width=400";
    }

    var frameWidth = '',
      frameHeight = '',
      newWidth = '',
      newHeight = '',
      a = '';
    try {
      var newWindow = window.open(url, name, settings);
    } catch (e) {
      return false;
    }

    newWindow.moveTo(0, 0);

    var setArr = settings.split(",");
    var winHeight = $(newWindow).height();
    var winWidth = $(newWindow).width();

    for (i in setArr) {
      var item = setArr[i].split("=");
      if ($.trim(item[0]) == 'height' && item[1] > winHeight) {
        winHeight = item[1]; //item[1]-winHeight;
      }
      if ($.trim(item[0]) == 'width' && item[1] > winWidth) {
        winWidth = item[1]; //item[1]-winWidth;
      }
    }

    setTimeout(function() {
      newWindow.resizeTo(winWidth, winHeight)
    }, 50);

    newWindow.location = url;
    newWindow.focus();
    // the var we set previously, if settings have been past ignore the next lot of code
    if (bFixed) return newWindow;

    if (self.innerWidth) {
      frameWidth = self.innerWidth;
      frameHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      frameWidth = document.documentElement.clientWidth;
      frameHeight = document.documentElement.clientHeight;
    } else if (document.body) {
      frameWidth = document.body.clientWidth;
      frameHeight = document.body.clientHeight;
    } else return newWindow;

    if (self.screen.width < frameWidth * 2 || self.screen.height < frameHeight * 2) {
      newWidth = self.screen.width * 0.9;
      newHeight = self.screen.height * 0.2;
      newWindow.resizeTo(newWidth, newHeight);
    }
    return newWindow;
  },

  /* Name      clone
   * Purpose   To create a clone of an object with no reference to the object being cloned.
   * Params    obj    The object to be cloned.
   * Returns   The new object.
   */
  clone: function(obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[i] = obj[i];
      }
    }
    return target;
  },

  /* Name      getCookie
   * Purpose   To get the value of a cookie referenced by the cookie name.
   * Params    name      The name of the cookie to be used.
   * Returns   +ve       Returns the value of the cookie.
   *           -ve       null.
   */
  getCookie: function(name) {
    // Get document's cookie string.
    var sDocumentCookies = document.cookie;
    // Split cookies to get each individual cookie.
    var aCookieSplit = sDocumentCookies.split('; ');

    // Loop the array.
    for (var i = 0; i < aCookieSplit.length; i++) {
      // Split the item (cookie) by = to get key/value pairs.
      var aTempSplit = aCookieSplit[i].split('=');

      // If the cookie name is equal to the value passed in.
      if (aTempSplit[0] === name) {
        // Return the value.
        return unescape(aTempSplit[1]);
      }
      // END if.
    }
    // END loop.

    // Return null if cookie not found.
    return null;
  },

  /* Name      deleteCookie
   * Purpose   To set the value of a cookie to the past which will prevent it from being used.
   * Params    name      The name of the cookie to be used.
   */
  deleteCookie: function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },

  /* Name      createCookie
   * Purpose   To create a cookie by assigning a name, value, and number of days it's to be valid for.
   * Params    name      The name of the cookie to be used.
   *           value     The value to be assigned to the cookie.
   *           days      Number of days it's to be valid for.
   */
  createCookie: function(name, value, days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
  },

  /*  Name      log
   *  Purpose   To log a message to the browsers console.
   *  @params   {string}    message    The message to be output.
   *            {string}    sEvent     The type of message.
   */
  log: function(message, type) {
    // Check if console.log exists.
    if (console && console.log) {
      // Variable to hold style.
      var style = "padding: 3px;";

      // Switch the type to determine style.
      switch (type) {
        // View render.
        case 'viewRender':
          style += 'background: #C0EAC0; color: #78CC78;';
          break;
          // Object initiation.
        case 'initiated':
          style += 'background: #8DC1E0; color: #659EBC;';
          break;
          // Error.
        case 'error':
          style += 'background: #D9534F; color: #ffffff;';
          break;
          // Debug.
        case 'debug':
          style += 'background: #F0AD4E; color: #ffffff;';
          break;
          // Route change.
        case 'routeChange':
          style += 'background: #F7F7F9; color: #CECEEF;';
          break;
          // Default.
        default:
          style += 'background: #F0AD4E; color: #ffffff;';
          break;
      }
      // END switch.

      // Log the message.
      console.log('%c ' + message + '.', style);
    }
    // END if console.log.
  },

  /*  Name      setBootstrapModulus
   *  Purpose   To set the value of the variable depending on the current browser width.
   *  @params   {int}     idth    The current browser width.
   */
  setBootstrapModulus: function(width) {
    // If the width is >= than 1200px.
    if (width >= 1200) {
      app.bootstrapRowModulus = 3;
      app.bootstrapDeviceSize = 'large';
    }
    // If the width is >= 992px.
    else if (width >= 992) {
      app.bootstrapRowModulus = 3;
      app.bootstrapDeviceSize = 'medium';
    }
    // If the width is >= 768px.
    else if (width >= 768) {
      app.bootstrapRowModulus = 2;
      app.bootstrapDeviceSize = 'small';
    }
    // If the width is < 768px.
    else if (width < 768) {
      app.bootstrapRowModulus = 1;
      app.bootstrapDeviceSize = 'extraSmall';
    }
  },

  /*  Name      validateInput
   *  Purpose   To validate an input based on it's data-type.
   */
  validateInput: function(input) {
    // Get the data type for the input, the value, and set a var to hold error result.
    var dataType = input.data('type'),
      val = input.val(),
      errors = false;

    // Check it is not empty.
    if (val === '') {
      // Call function to remove error display from input.
      app.addInputError(input);
      // Prevent further execution.
      return false;
    }

    // Switch the data type.
    switch (dataType) {
      case 'string':
        if (typeof val !== 'string') {
          // Call function to remove error display from input.
          app.addInputError(input);
          errors = true;
        }
        break;

      case 'int':
        if (isNaN(val)) {
          // Call function to remove error display from input.
          app.addInputError(input);
          errors = true;
        }
        break;
    }

    // If errors is false.
    if (!errors) app.removeInputError(input);
  },


  /*  Name      addInputError
   *  Purpose   To add error attributes to an input when it has failed validation.
   */
  addInputError: function(input) {
    // Get the input container.
    var elFormGroup = input.closest('.form-group');

    // Remove class from input container.
    elFormGroup.removeClass('has-success');

    // Add class to input container.
    elFormGroup.addClass('has-error');

    // Add tooltip to input. Set trigger to manual so that it doesn't hide.
    input.tooltip({
        trigger: 'manual'
      })
      .tooltip('show');
    // END tooltip.

  },

  /*  Name      removeInputError
   *  Purpose   To remove error attributes from an input when it has passed validation.
   */
  removeInputError: function(input) {
    // Get the input container.
    var elFormGroup = input.closest('.form-group');

    // Remove class from input container.
    elFormGroup.removeClass('has-error');

    // Add success class.
    elFormGroup.addClass('has-success');

    // Destroy the input's tooltip.
    input.tooltip('destroy')

  },

  /*  Name      onWindowResize
   *  Purpose   To get the width of the document's body and provide that to various
   *            modules.
   */
  onWindowResize: function() {
    // Get the width.
    var width = $('body').outerWidth();

    // Call function to set Bootstrap row modulus.
    app.setBootstrapModulus(width);

    // Trigger event.
    Backbone.trigger(app.currentRoute + ':resize');
  },

  /*  Name      setupDOMListeners
   *  Purpose   To listen for DOM events and carry out logic.
   */
  setupDOMListeners: function() {
    // Assign scope.
    var $this = this;

    // When message close is clicked.
    $(document).on('click', '.message .message-close', function() {
      // Slide the parent up.
      $(this).parent().slideUp('fast', function() {
        $(this).remove();
      });

    });

    // When the browser resizes.
    $(window).resize(function() {
      // Call function to handle resize();
      $this.onWindowResize();
    });

    // When the browser resizes.
    $(window).load(function() {
      // Call function to handle resize();
      $this.onWindowResize();
    });

    // On add-game click.
    $(document).on('click', '.add-game', function() {
      // Trigger event.
      Backbone.trigger('game:addClick');
    });

    // When a navbar link is clicked.
    $(document).on('click', '#navbar a', function() {
      // If the browser size is extraSmall, close menu.
      if ($this.bootstrapDeviceSize === 'extraSmall') $('#navbar .navbar-toggle').click()
    });
  }



};

/* Name      String.prototype.trunc - called using "var s = 'test'; s.trunc(n, useWordBoundary);"
 * Purpose   To take in a string and truncate it by a certain length.
 * Params    n                  The number the string is to be truncated by.
 *           useWordBoundary    If string is to preserve full words i.e. not cut off in middle of word.
 * Returns   The string converted into a class selector.
 */
String.prototype.trunc = function(n, useWordBoundary) {
  var toLong = this.length > n,
    s_ = toLong ? this.substr(0, n - 1) : this;
  s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
  s_ = s_.trim();
  return toLong ? s_ + '&hellip;' : s_;
};

if (typeof String.prototype.trim != 'function') { // detect native implementation
  String.prototype.trim = function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  };
}

Number.prototype.toCurrency = function() {
  // pass a number and it will return it in a currency formatted string.
  // what it does that others dont though is onl
  // - dNumber:
  var sNumber = this.toString();
  // first validate it as a number
  bSuccess = sNumber.match(/^[0-9]+([.]+[0-9]+){0,1}$/);
  if (!bSuccess) {
    return false;
  }
  // now, validate it and different decimal places (for now, 2 is enough)
  // ** this could do with some kinda of loop depending on decimal places
  // required. At the mo, just fixed at two limit
  // whole number
  bSuccess = sNumber.match(/^[0-9]+$/);
  if (bSuccess) {
    return sNumber;
  }
  // one decimal place
  bSuccess = sNumber.match(/^[0-9]+([.]+[0-9]{1})+$/);
  if (bSuccess) {
    return sNumber + "0";
  }
  // two decimal place
  bSuccess = sNumber.match(/^[0-9]+([.]+[0-9]{2})+$/);
  if (bSuccess) {
    return sNumber;
  }
  return this.toFixed(2);
}


String.prototype.capitaliseFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
