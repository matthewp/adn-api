(function() {
	"use strict";

	/*
	{
    "type": "net.app.core.geolocation",
    "value": {
        "latitude": 74.0064,
        "longitude": 40.7142,
        "altitude": 4400,
        "horizontal_accuracy": 100,
        "vertical_accuracy": 100
    }
	}
	*/

	function Geolocation(lat, lng) {
		this.type = 'net.app.core.geolocation';
		this.latitude = lat;
		this.longitude = lng;
	}

	Geolocation.prototype = {
		latitude: null,
		longitude: null
	};

	Object.defineProperty(ADN.Annotations, 'Geolocation', {
		value Geolocation
	});

})();