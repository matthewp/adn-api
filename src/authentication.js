(function() {
  "use strict";

  /*
  https://api.app.net/oauth/authenticate
  ?client_id=[your client ID]
  &response_type=token
  &redirect_uri=[your redirect URI]
  &scopes=[scopes separated by commas]
  */

  var BASE_URI = 'https://alpha.app.net/oauth/authorize';

  function Authenticator(clientID, redirectURI) {
    this.clientID = clientID;
    this.redirectURI = redirectURI;


  }

  Authenticator.prototype = {

    authenticate: function() {
      window.location = this.getUri();
    },

    clearToken: function() {
      localStorage.removeItem('accessToken');
    },

    getUri: function() {
      return BASE_URI +
        '?client_id=' + this.clientID +
        '&response_type=token' +
        '&redirect_uri=' + this.redirectURI +
        '&scope=write_post,follow,messages,stream';
    },
    
    /*
    * Check localStorage for the access token.
    */
    hasAccessToken: function() {
      return typeof localStorage['accessToken'] !== 'undefined'
        && localStorage['accessToken'] !== null;
    },

    /*
    * Check to see if we have just redirected from a login.
    */
    hasRedirected: function() {
      var accessToken = window.location.hash.substr(1).split('access_token=')[1];
      if(!accessToken) {
        return false;
      } else {
        localStorage['accessToken'] = accessToken;
        window.location = this.redirectURI; // Token gotten, redirect.

        return true;
      }
    },

    isAuthenticated: function() {
      return this.hasAccessToken() || this.hasRedirected();
    }

  };

  Object.defineProperty(ADN, 'Authenticator', {
    value: Authenticator
  });

})();