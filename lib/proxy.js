'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

var DEFAULT_TIME = 60 * 1000;
var DEFAULT_URLS = [
  null,
  null
];


function Proxy(config) {

  this.inited = false;
  this.updateTimer = null;
  this.time = DEFAULT_TIME;
  
  if(config === false) {
    this.noProxy = true;
    this.urls = DEFAULT_URLS;
    this.inited = true;
  }

  config = config || {};
  this.urls = config.urls || DEFAULT_URLS;

  this.typeProxies = [[{
    url: null
  }]];


  this.tryRange = [0, this.urls.length - 1];

  if(config.typeProxies) {
    this.typeProxies = config.typeProxies;
    this.setRetryRange(config.tryRange || [0, this.typeProxies.length - 1]);
    // 无需远程获取
    this.inited = true;
  }
}

Proxy.prototype.init = function() {
  if(this.inited) {
    return Promise.resolve();
  }
  this.inited = true;

  var that = this;
  clearInterval(this.updateTimer);
  this.updateTimer = setInterval(function() {
    that.getProxiesByUrl();
  }, this.time);

  return this.getProxiesByUrl();
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
  if(this.noProxy) {
    return null;
  }
  type = this.getValidType(type);
  var proxies = this.typeProxies[type];
  return proxies[parseInt(Math.random() * proxies.length)].url;
};

Proxy.prototype.setRetryRange = function(arr) {
  var tryRange = [0, this.urls.length - 1];
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

Proxy.prototype.clearUpdateInterval = function() {
  clearInterval(this.updateTimer);
};

Proxy.prototype.setUpdateInterval = function(config) {
  var that = this;
  config = config || {};
  clearInterval(this.updateTimer);
  this.updateTimer = setInterval(function() {
    that.getProxiesByUrl();
  }, config.time || DEFAULT_TIME);
};

function getName(proxyConfig) {
  if(proxyConfig === false || proxyConfig && proxyConfig.noProxy === true) {
    return '__no_proxy__';
  }
  if(!proxyConfig) {
    return '__default__';
  }

  var urls = proxyConfig.urls || DEFAULT_URLS;
  var range = proxyConfig.tryRange || [0, urls.length - 1];
  var time = proxyConfig.time || DEFAULT_TIME;

  var name = '' + range.join('|') + urls.join('|') + '|' + time;
  return name === Proxy.DEFAULT_NAME ? '__default__' : name;
}

Proxy.DEFAULT_NAME =  getName({
  urls: DEFAULT_URLS,
  time: DEFAULT_TIME
});
Proxy.getName = getName;
Proxy.prototype.getName = function() {
  return getName(this);
};

module.exports = Proxy;