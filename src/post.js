(function() {
  "use strict";

  function Post(id) {
    ADN.Access.apply(this, arguments);

    this.id = id;
    this.endpoint = new ADN.Endpoint('posts/{0}');
    this.createEndpoint = new ADN.Endpoint('posts');
    this.annotations = [];
  }

  Post.prototype = Object.create(ADN.Access.prototype);

  Post.prototype.addAnnotation = function(annotation) {
    this.annotations.push(annotation);
  };

  Post.prototype.deletePost = function(id, callback, errback) {
    id = id || this.id;
    this.endpoint.addUrlParameter(id);

    var options = {
      method: 'DELETE',
      credentials: true
    };

    this.sendRequest(options, function(data) {
      if(data) {
        callback();
      } else {
        errback();
      }
    }, errback);
  };

  Post.prototype.postMessage = function(data, callback, errback) {
    var options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      endpoint: this.createEndpoint,
      method: 'POST',
      data: data,
      credentials: false
    };

    this.sendRequest(options, callback, errback);
  };

  Post.prototype.retrieve = function(callback, errback) {
    this.endpoint.addUrlParameter(this.id);

    this.sendRequest(null, callback, errback);
  };

  Post.sort = function(posts, eqComparer) {
    return (posts || []).sort(function(a, b) {
      var date1 = Date.parse(a.created_at),
          date2 = Date.parse(b.created_at);

      return eqComparer(date1, date2) ? 1 : -1;
    });
  };

  Post.sortAscending = function(posts) {
    return this.sort(posts, function(a, b) {
      return a > b;
    });
  };

  Post.sortDescending = function(posts) {
    return this.sort(posts, function(a, b) {
      return a < b;
    });
  };

  Object.defineProperty(ADN, 'Post', {
    value: Post
  });

})();