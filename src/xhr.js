(function() {
  "use strict";

  function XhrError(message, status) {
    this.message = message;
    this.status = status;
  }

  XhrError.prototype = new Error();
  XhrError.prototype.constructor = XhrError;

  function xhr(options, callback, errback) {
    var req = new XMLHttpRequest();

    req.open(options.method || 'GET', options.url, true);

    if(options.credentials) {
      req.withCredentials = true;
    }

    // Set request headers if provided.
    Object.keys(options.headers || {}).forEach(function(key) {
      req.setRequestHeader(key, options.headers[key]);
    });

    req.onload = function(e) {
      if([200, 304, 0].indexOf(req.status) === -1) {
        errback(new XhrError('Server responded with a status of ' + req.status, req.status));
      } else {
        callback(e.target);
      }
    };

    req.send(options.data || void 0);
  }

  Object.defineProperty(ADN, 'xhr', {
    value: xhr
  });

  Object.defineProperty(ADN, 'XhrError', {
    value: XhrError
  });

})();