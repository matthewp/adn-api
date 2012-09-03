Browser-based JavaScript wrapper for the App.Net API. It provides 1 window-level namespace, ADN. To use:

// First you need to ensure that you have authenticated.
var MY_CLIENT_ID = 'somelongstring',
		CALLBACK_URI = 'http://foo.com'

var auth = new ADN.Authenticator(MY_CLIENT_URI, CALLBACK_URI);
if(!auth.isAuthenticated()) {
  auth.authenticate();

  return;
}

// Now you can safely assume that the user is authenticated. Perhaps you'd like to grab the global feed?
var globalStream = new ADN.Global();
globalStream.fetchNew(function(msgs) {
	// I have msgs!
});

WARNING: This library currently doesn't use any of the migrations.