(function() {

  this.ADN = {
  	Annotations: {}
  };

}).call(this);
(function() {
  "use strict";

  function XhrError(message, status) {
    this.message = message;
    this.status = status;
  }

  XhrError.prototype = new Error();
  XhrError.prototype.constructor = XhrError;

  function xhr(options, callback, errback) {
    var req = new XMLHttpRequest();

    req.open(options.method || 'GET', options.url, true);

    if(options.credentials) {
      req.withCredentials = true;
    }

    // Set request headers if provided.
    Object.keys(options.headers || {}).forEach(function(key) {
      req.setRequestHeader(key, options.headers[key]);
    });

    req.onload = function(e) {
      if([200, 304, 0].indexOf(req.status) === -1) {
        errback(new XhrError('Server responded with a status of ' + req.status, req.status));
      } else {
        callback(e.target);
      }
    };

    req.send(options.data || void 0);
  }

  Object.defineProperty(ADN, 'xhr', {
    value: xhr
  });

  Object.defineProperty(ADN, 'XhrError', {
    value: XhrError
  });

})();
(function() {
  "use strict";

  /*
  https://api.app.net/oauth/authenticate
  ?client_id=[your client ID]
  &response_type=token
  &redirect_uri=[your redirect URI]
  &scopes=[scopes separated by commas]
  */

  var BASE_URI = 'https://alpha.app.net/oauth/authorize';

  function Authenticator(clientID, redirectURI) {
    this.clientID = clientID;
    this.redirectURI = redirectURI;


  }

  Authenticator.prototype = {

    authenticate: function() {
      window.location = this.getUri();
    },

    clearToken: function() {
      localStorage.removeItem('accessToken');
    },

    getUri: function() {
      return BASE_URI +
        '?client_id=' + this.clientID +
        '&response_type=token' +
        '&redirect_uri=' + this.redirectURI +
        '&scope=write_post,follow,messages,stream';
    },
    
    /*
    * Check localStorage for the access token.
    */
    hasAccessToken: function() {
      return typeof localStorage['accessToken'] !== 'undefined'
        && localStorage['accessToken'] !== null;
    },

    /*
    * Check to see if we have just redirected from a login.
    */
    hasRedirected: function() {
      var accessToken = window.location.hash.substr(1).split('access_token=')[1];
      if(!accessToken) {
        return false;
      } else {
        localStorage['accessToken'] = accessToken;
        window.location = this.redirectURI; // Token gotten, redirect.

        return true;
      }
    },

    isAuthenticated: function() {
      return this.hasAccessToken() || this.hasRedirected();
    }

  };

  Object.defineProperty(ADN, 'Authenticator', {
    value: Authenticator
  });

})();
(function() {
  "use strict";

  var BASE_URL = 'https://alpha-api.app.net/stream/0/';

  function stringFormat() {
    var args = Array.prototype.slice.call(arguments),
        result = '';

    var format = args[0];
    args.splice(0, 1);
    result = format;

    args.forEach(function(arg, i) {
      var value = arg.toString();

      result = result.replace('{' + i + '}', value);
    });

    return result;
  }

  function Endpoint(format) {
    this.format = format;

    this.urlParameters = [];
    this.queryParameters = [];
  }

  Endpoint.prototype = {

    addQueryParameter: function(key, value) {
      this.queryParameters.push([key, value]);
    },

    addUrlParameter: function(value) {
      this.urlParameters.push(value);
    },

    buildUrl: function() {
      var url = BASE_URL + this.format;

      if(this.urlParameters.length > 0) {
        var urlParams = this.urlParameters.slice(0);
        urlParams.unshift(url);
        url = stringFormat.apply(null, urlParams);
      }

      if(this.queryParameters.length === 0) {
        return url;
      }

      this.queryParameters.forEach(function(param, i) {
        var sep = i === 0 ? '?' : '&';
        url += sep + param[0] + '=' + param[1];
      });

      return url;
    },

    reset: function() {
      this.queryParameters = [];
      this.urlParameters = [];
    }

  };

  Object.defineProperty(ADN, 'Endpoint', {
    value: Endpoint
  });

})();
(function() {
  "use strict";

  function APIAccess() {

  }

  APIAccess.prototype = {

    sendRequest: function(options, callback, errback) {
      options = options || {};
      options.url = (options.endpoint || this.endpoint).buildUrl();
      options.headers = options.headers || {};
      options.headers['Authorization'] = 'Bearer ' + localStorage['accessToken'];
      options.headers['Accept'] = 'application/json';

      this.endpoint.reset();
      ADN.xhr(options, function(req) {
        if(req && req.responseText) {
          var data = JSON.parse(req.responseText);
          callback(data);
        } else {
          callback();
        }
      }, function onError(err) {
        if(err instanceof ADN.XhrError && err.status === 401) {
          var auth = new ADN.Authenticator();
          auth.clearToken();
          auth.authenticate();
        }

        (errback || function() { })(err);
      });
    }

  };

  Object.defineProperty(ADN, 'Access', {
    value: APIAccess
  });

})();
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
(function() {
  "use strict";

  var USER_URI = 'https://alpha-api.app.net/stream/0/users/';

  function User() {
    this.endpoint = new ADN.Endpoint('users/{0}');
    this.followEndpoint = new ADN.Endpoint('users/{0}/follow');
    this.muteEndpoint = new ADN.Endpoint('users/{0}/mute');
  }

  User.prototype = Object.create(ADN.Access.prototype);

  User.prototype.retrieve = function(name, callback, errback) {
    this.endpoint.addUrlParameter(name);

    this.sendRequest(null, callback, errback);
  };

  User.prototype.endpointCall = function(name, endpoint, method, callback, errback) {
    endpoint.addUrlParameter(name);

    var options = {
      endpoint: endpoint,
      method: method,
      credentials: true
    };

    this.sendRequest(options, callback, errback);
  };

  User.prototype.follow = function(name, callback, errback) {
    this.endpointCall(name, this.followEndpoint, 'POST', callback, errback);
  };

  User.prototype.unfollow = function(name, callback, errback) {
    this.endpointCall(name, this.followEndpoint, 'DELETE', callback, errback);
  };

  User.prototype.mute = function(name, callback, errback) {
    this.endpointCall(name, this.muteEndpoint, 'POST', callback, errback);
  };

  User.prototype.unmute = function(name, callback, errback) {
    this.endpointCall(name, this.muteEndpoint, 'DELETE', callback, errback);
  };

  Object.defineProperty(ADN, 'User', {
    value: User
  });

})();
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

  Post.prototype.postMessage = function(callback, errback) {
    var data = {
      text: this.text,
      reply_to: this.replyTo,
      annotations: this.annotations
    };

    var options = {
      headers: {
        'Content-Type': 'application/json'
      },
      endpoint: this.createEndpoint,
      method: 'POST',
      data: JSON.stringify(data),
      credentials: false
    };

    this.sendRequest(options, callback, errback);
  };

  Post.prototype.retrieve = function(callback, errback, includeAnnotations) {
    this.endpoint.addUrlParameter(this.id);

    if(includeAnnotations) {
      this.endpoint.addQueryParameter('include_annotations', 1)
    }

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