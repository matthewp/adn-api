(function() {
  "use strict";

  function APIAccess() {

  }

  APIAccess.prototype = {

    sendRequest: function(options, callback, errback) {
      options = options || {};
      options.url = (options.endpoint || this.endpoint).buildUrl();
      options.headers = options.headers || {};
      options.headers['Authorization'] = 'Bearer ' + localStorage['accessToken'];
      options.headers['Accept'] = 'application/json';

      this.endpoint.reset();
      ADN.xhr(options, function(req) {
        if(req && req.responseText) {
          var data = JSON.parse(req.responseText);
          callback(data.data || data);
        } else {
          callback();
        }
      }, function onError(err) {
        if(err instanceof ADN.XhrError && err.status === 401) {
          var auth = new ADN.Authenticator();
          auth.clearToken();
          auth.authenticate();
        }

        (errback || function() { })(err);
      });
    }

  };

  Object.defineProperty(ADN, 'Access', {
    value: APIAccess
  });

})();
