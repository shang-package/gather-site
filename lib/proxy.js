'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

var utilities = require('./utilities');

var DEFAULT_TIME = 5 * 60 * 1000;
var DEFAULT_URLS = [];

function Proxy(config) {
  this.config = config;

  if(config === false) {
    // 不设置代理，不重试
    this.proxies = [null];
  }
  else if(!config) {
    // 不设置代理，重试一次
    this.proxies = [null, null];
  }
  else {
    this.config.urls = [].concat(config.urls);

    // 第1次不设置代理，后面采用代理
    if(config.beforeProxies !== false) {
      config.beforeProxies = config.beforeProxies || [null];
    }
  }
}

Proxy.prototype.init = function() {
  if(this.config && this.config.urls) {
    return this.setGetRemoteProxies(this.config);
  }
  return Promise.resolve(this.proxies);
};

Proxy.prototype.get = function(index) {
  index = index || 0;
  if(index < 0 || index >= this.proxies.length) {
    index = 0;
  }
  return this.proxies[index];
}

Proxy.prototype.setGetRemoteProxies = function(config) {
  var that = this;
  if(this.__urlsDeferred__) {
    return this.__urlsDeferred__.promise;
  }
  this.__urlsDeferred__ = utilities.defer();

  var time = config.time || DEFAULT_TIME;
  var beforeProxies = config.beforeProxies || [];
  var afterProxies = config.afterProxies || [];

  function getProxies() {
    Promise
      .map([].concat(that.config.urls), function(url) {
        return request(
          {
            url: url,
            method: 'GET',
            json: true
          })
          .spread(function(res, body) {
            return body;
          })
          .catch(function(e) {
            console.error('get url error: ', url, e);
            return [];
          });
      })
      .then(function(data) {
        return Array.prototype.concat.apply([], data)
          .map(function(item) {
            return item && item.url;
          })
          .filter(function(item) {
            return item;
          });
      })
      .then(function(proxies) {
        if(proxies && proxies.length) {
          that.proxies = Array.prototype.concat.apply([], [beforeProxies, proxies, afterProxies]);
        }

        that.__urlsDeferred__.resolve(that.proxies);
      })
      .catch(function(e) {
        that.__urlsDeferred__.reject(e);
      });

    return that.__urlsDeferred__.promise;
  }

  this.__urlsIntervalTimer__ = setInterval(getProxies, time);
  return getProxies();
};

Proxy.prototype.clearUpdateInterval = function() {
  clearInterval(this.__urlsIntervalTimer__);
};

function getName(proxyConfig) {
  if(proxyConfig === false || proxyConfig && proxyConfig.noProxy === true) {
    return '__no_proxy__';
  }
  if(!proxyConfig) {
    return '__default__';
  }

  var urls = proxyConfig.urls || DEFAULT_URLS;
  var time = proxyConfig.time || DEFAULT_TIME;

  var name = '' + urls.join('|') + '|' + time;
  return name === Proxy.DEFAULT_NAME ? '__default__' : name;
}

Proxy.DEFAULT_NAME = getName({
  urls: DEFAULT_URLS,
  time: DEFAULT_TIME
});
Proxy.getName = getName;
Proxy.prototype.getName = function() {
  return getName(this.config);
};

module.exports = Proxy;