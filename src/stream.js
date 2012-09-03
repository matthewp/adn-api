(function() {
  "use strict";

  function Stream() {
    ADN.Access.apply(this, arguments);
  }

  Stream.prototype = Object.create(ADN.Access.prototype);

  Stream.prototype.setOldestPostId = function(msgs) {
    if(msgs && msgs.length > 0) {
      this.oldestPostId = msgs[msgs.length - 1].id;
    }
  };

  Stream.prototype.setNewestPostId = function(msgs) {
    if(msgs && msgs.length > 0) {
      this.newestPostId = msgs[0].id;
    }
  };

  Stream.prototype.fetchNew = function(callback, errback) {
    if(this.newestPostId) {
      this.endpoint.addQueryParameter('min_id', this.newestPostId);
    } else {
      var setOldest = true;
    }

    var self = this;

    this.retrieve(function(msgs) {
      msgs.sort(function(a, b) {
        if(a.id < b.id) {
          return 1;
        } else {
          return -1;
        }
      });

      self.setNewestPostId(msgs);
      setOldest && self.setOldestPostId(msgs);
      callback(msgs);
    }, errback);
  };

  Stream.prototype.fetchMore = function(callback, errback) {
    if(!this.oldestPostId) {
      return;
    }

    var self = this;

    this.endpoint.addQueryParameter('max_id', this.oldestPostId);
    this.retrieve(function(msgs) {
      msgs.sort(function(a, b) {
        if(a.id < b.id) {
          return 1;
        } else {
          return -1;
        }
      });

      self.setOldestPostId(msgs);
      callback(msgs);
    }, errback);
  };

  Stream.prototype.retrieve = function(callback, errback) {
    var self = this;

    this.sendRequest(null, function(messages) {
      callback.call(self, messages);
    }, errback);
  };

  Object.defineProperty(ADN, 'Stream', {
    value: Stream
  });

})();