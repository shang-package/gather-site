'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

var _timer = null;

function Proxy() {
  this.inited = false;
  this.tryRange = [0, 0];
  this.typeProxies = [[{
    url: null
  }]];
  this.urls = [
    null,
    'http://proxy.coding.io/api/v1/proxy?type=nn&perPage=3',
    'http://proxy.coding.io/api/v1/proxy?type=nt&perPage=3'
  ];
}

Proxy.prototype.init = function(config) {
  if(this.inited) {
    return;
  }
  this.inited = true;
  config = config || {};
  if(config.urls) {
    this.urls = config.urls;
  }
  if(config.typeProxies) {
    this.typeProxies = config.typeProxies;
    this.setRetryRange(config.tryRange);
    return;
  }

  var that = this;
  clearInterval(_timer);
  _timer = setInterval(function() {
    that.getProxiesByUrl();
  }, config.time || 60 * 1000);

  return this.getProxiesByUrl()
    .then(function() {
      if(config.tryRange) {
        that.setRetryRange(config.tryRange);
      }
      return null;
    });
};

Proxy.prototype.getProxiesByUrl = function() {
  var that = this;

  function getJson(url) {
    return request(
      {
        url: url,
        method: 'GET',
        json: true
      })
      .spread(function(res, body) {
        return body;
      });
  }

  return Promise
    .all(Promise.map(that.urls, function(item) {
      if(!item) {
        return Promise
          .resolve([{
            url: null
          }])
          .reflect();
      }
      return getJson(item).reflect();
    }))
    .each(function(item, index) {
      if(item.isFulfilled()) {
        that.typeProxies[index] = item.value();
      }
      else {
        console.error('A promise was rejected with', item.reason());
      }
    });
};

Proxy.prototype.getOne = function(type) {
  type = this.getValidType(type);
  var proxies = this.typeProxies[type];
  return proxies[parseInt(Math.random() * proxies.length)].url;
};

Proxy.prototype.setRetryRange = function(arr) {
  var tryRange = [0, 0];
  if(!arr) {
    console.log('proxyRange: ', tryRange);
    return tryRange;
  }
  tryRange[0] = this.getValidType(arr[0]);
  tryRange[1] = this.getValidType(arr[1], this.typeProxies.length - 1);

  if(tryRange[0] > tryRange[1]) {
    tryRange[0] = tryRange[1];
  }

  console.log('proxyRange: ', tryRange);
  this.tryRange = tryRange;
  return tryRange;
};

Proxy.prototype.getValidType = function(type, defaultValue) {
  defaultValue = defaultValue || 0;
  if(!Number.isInteger(type)) {
    return defaultValue;
  }
  if(type < 0) {
    return defaultValue;
  }
  if(type >= this.typeProxies.length) {
    type = this.typeProxies.length - 1;
  }

  return type;
};

Proxy.prototype.clearInterval = function() {
  clearInterval(_timer);
};

Proxy.prototype.setInterval = function(config) {
  var that = this;
  config = config || {};
  clearInterval(_timer);
  _timer = setInterval(function() {
    that.getProxiesByUrl();
  }, config.time || 60 * 1000);
};

module.exports = Proxy;