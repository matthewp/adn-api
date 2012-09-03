(function() {
  "use strict";

  function Replies(postId) {
    ADN.Access.apply(this, arguments);

    this.postId = postId;
    this.endpoint = new ADN.Endpoint('posts/{0}/replies');
  }

  Replies.prototype = Object.create(ADN.Access.prototype);

  Replies.prototype.retrieve = function(callback, errback) {
    this.endpoint.addUrlParameter(this.postId);

    this.sendRequest(null, callback, errback);
  };

  Object.defineProperty(ADN, 'Replies', {
    value: Replies
  });

})();