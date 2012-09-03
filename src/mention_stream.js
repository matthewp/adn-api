(function() {
  "use strict";

  function Mentions() {
    ADN.Stream.apply(this, arguments);

    this.endpoint = new ADN.Endpoint('users/me/mentions');
  }

  Mentions.prototype = Object.create(ADN.Stream.prototype);

  Object.defineProperty(ADN, 'Mentions', {
    value: Mentions
  });

})();