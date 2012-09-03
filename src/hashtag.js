(function() {
	"use strict";

	function Hashtag(tag) {
		ADN.Stream.apply(this, arguments);

		this.endpoint = new ADN.Endpoint('posts/tag/' + tag);
	}

  Hashtag.prototype = Object.create(ADN.Stream.prototype);

	Object.defineProperty(ADN, 'Hashtag', {
		value: Hashtag
	});

})();