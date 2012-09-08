(function() {
	"use strict";

	function Geolocation(lat, lng, alt, horz, vert) {
		this.type = 'net.app.core.geolocation';

		this.value = {
			latitude: lat,
			longitude: lng,
			horizontal_accuracy: horz,
			vertical_accuracy: vert
		};
	}

	Object.defineProperty(ADN.Annotations, 'Geolocation', {
		value: Geolocation
	});

})();