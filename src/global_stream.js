(function() {
  "use strict";

  function Global() {
    ADN.Stream.apply(this, arguments);

    this.endpoint = new ADN.Endpoint('posts/stream/global');
  }

  Global.prototype = Object.create(ADN.Stream.prototype);

  Object.defineProperty(ADN, 'Global', {
    value: Global
  });

})();