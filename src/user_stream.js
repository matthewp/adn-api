(function() {
	"use strict";

	function UserStream(userID) {
    ADN.Stream.apply(this, arguments);

    this.endpoint = new ADN.Endpoint('users/' + userID + '/posts');
  }

  UserStream.prototype = Object.create(ADN.Stream.prototype);

  Object.defineProperty(ADN, 'UserStream', {
    value: UserStream
  });

})();