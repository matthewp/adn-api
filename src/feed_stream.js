(function() {
  "use strict";

  function MainFeed() {
    ADN.Stream.apply(this, arguments);

    this.endpoint = new ADN.Endpoint('posts/stream');
  }

  MainFeed.prototype = Object.create(ADN.Stream.prototype);

  Object.defineProperty(ADN, 'Feed', {
    value: MainFeed
  });

})();