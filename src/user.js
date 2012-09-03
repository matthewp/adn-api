(function() {
  "use strict";

  var USER_URI = 'https://alpha-api.app.net/stream/0/users/';

  function User() {
    this.endpoint = new ADN.Endpoint('users/{0}');
    this.followEndpoint = new ADN.Endpoint('users/{0}/follow');
    this.muteEndpoint = new ADN.Endpoint('users/{0}/mute');
  }

  User.prototype = Object.create(ADN.Access.prototype);

  User.prototype.retrieve = function(name, callback, errback) {
    this.endpoint.addUrlParameter(name);

    this.sendRequest(null, callback, errback);
  };

  User.prototype.endpointCall = function(name, endpoint, method, callback, errback) {
    endpoint.addUrlParameter(name);

    var options = {
      endpoint: endpoint,
      method: method,
      credentials: true
    };

    this.sendRequest(options, callback, errback);
  };

  User.prototype.follow = function(name, callback, errback) {
    this.endpointCall(name, this.followEndpoint, 'POST', callback, errback);
  };

  User.prototype.unfollow = function(name, callback, errback) {
    this.endpointCall(name, this.followEndpoint, 'DELETE', callback, errback);
  };

  User.prototype.mute = function(name, callback, errback) {
    this.endpointCall(name, this.muteEndpoint, 'POST', callback, errback);
  };

  User.prototype.unmute = function(name, callback, errback) {
    this.endpointCall(name, this.muteEndpoint, 'DELETE', callback, errback);
  };

  Object.defineProperty(ADN, 'User', {
    value: User
  });

})();