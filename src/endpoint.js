(function() {
  "use strict";

  var BASE_URL = 'https://alpha-api.app.net/stream/0/';

  function stringFormat() {
    var args = Array.prototype.slice.call(arguments),
        result = '';

    var format = args[0];
    args.splice(0, 1);
    result = format;

    args.forEach(function(arg, i) {
      var value = arg.toString();

      result = result.replace('{' + i + '}', value);
    });

    return result;
  }

  function Endpoint(format) {
    this.format = format;

    this.urlParameters = [];
    this.queryParameters = [];
  }

  Endpoint.prototype = {

    addQueryParameter: function(key, value) {
      this.queryParameters.push([key, value]);
    },

    addUrlParameter: function(value) {
      this.urlParameters.push(value);
    },

    buildUrl: function() {
      var url = BASE_URL + this.format;

      if(this.urlParameters.length > 0) {
        var urlParams = this.urlParameters.slice(0);
        urlParams.unshift(url);
        url = stringFormat.apply(null, urlParams);
      }

      if(this.queryParameters.length === 0) {
        return url;
      }

      this.queryParameters.forEach(function(param, i) {
        var sep = i === 0 ? '?' : '&';
        url += sep + param[0] + '=' + param[1];
      });

      return url;
    },

    reset: function() {
      this.queryParameters = [];
      this.urlParameters = [];
    }

  };

  Object.defineProperty(ADN, 'Endpoint', {
    value: Endpoint
  });

})();