'use strict';

var Promise = require('bluebird');
var request = Promise.promisify(require('request'), {multiArgs: true});

var utilities = require('./utilities');

var DEFAULT_TIME = 5 * 60 * 1000;
var DEFAULT_URLS = [];

function Proxy(config) {
  this.config = {};
  this.proxies = [null];

  // 禁用代理，不重试
  if(config === false) {
    this.name = '__no_proxy__';
    this.config.beforeProxies = [];
  }// 重试一次
  else if(!config) {
    this.config.afterProxies = [null];
  }// 主动设置了 proxy 列表
  else if(config.proxies && config.proxies.length && config.name) {
    this.proxies = config.proxies;
    this.config.beforeProxies = [];
  }// 不设置前置代理
  else if(config.beforeProxies === false) {
    this.config.beforeProxies = [];
  }// 不存在 urls 获取代理, 设置成 重试一次
  else if(!config.urls || !config.urls.length) {
    config.urls = [];
    this.config.afterProxies = [null];
  }
  else {
    this.config.urls = [].concat(config.urls);
    // 默认设置前置代理
    this.config.beforeProxies = config.beforeProxies || [null];
  }

  if(config && config.name) {
    this.config.name = config.name;
  }

  this.config.afterProxies = this.config.afterProxies || [];
}

Proxy.prototype.init = function() {
  if(this.config.urls) {
    return this.setGetRemoteProxies(this.config);
  }

  this.proxies = Array.prototype.concat.apply([], [this.config.beforeProxies, this.config.afterProxies]);

  return Promise.resolve(this.proxies);
};

Proxy.prototype.get = function(index) {
  index = index || 0;
  if(index < 0 || index >= this.proxies.length) {
    index = 0;
  }
  return this.proxies[index];
};

Proxy.prototype.setGetRemoteProxies = function(config) {
  var that = this;
  if(this.__urlsDeferred__) {
    return this.__urlsDeferred__.promise;
  }
  this.__urlsDeferred__ = utilities.defer();

  var time = config.time || DEFAULT_TIME;

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
          that.proxies = Array.prototype.concat.apply([], [config.beforeProxies, proxies, config.afterProxies]);
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
  if(proxyConfig === false) {
    return '__no_proxy__';
  }

  if(!proxyConfig) {
    return '__default__';
  }

  if(proxyConfig.name) {
    return proxyConfig.name;
  }

  var urls = proxyConfig.urls || DEFAULT_URLS;
  var time = proxyConfig.time || DEFAULT_TIME;

  var name = '' + JSON.stringify(urls) + '|' + time;
  return name === Proxy.DEFAULT_NAME ? '__default__' : name;
}

Proxy.DEFAULT_NAME = getName({
  urls: DEFAULT_URLS,
  time: DEFAULT_TIME
});

Proxy.getName = getName;
Proxy.prototype.getName = function() {
  if(!this.name) {
    this.name = getName(this.config);
  }
  return this.name;
};

module.exports = Proxy;