'use strict';

var extend = require('extend');
var Promise = require('bluebird');

var Spider = require('./lib/spider.js');
var proxyPool = require('./lib/proxyPool.js');
var retryStrategy = require('./lib/retryStrategy.js');

function gather(requestConfig, parseConfig, proxyConfig) {
  var spider;

  return proxyPool
    .getProxy(proxyConfig)
    .then(function(proxy) {
      spider = new Spider(requestConfig, parseConfig, proxy);
      if(!spider.checkRule()) {
        return Promise.reject(new Error('参数非法'));
      }
      return spider.download();
    })
    .then(function() {
      return spider.parse();
    });
}

module.exports = gather;
module.exports.proxyPool = proxyPool;
module.exports.retryStrategy = retryStrategy;

// 设置默认
module.exports.defaults = function(defaultRequestConfig, defaultParseConfig, defaultProxyConfig) {
  // jar need request.defaults
  var myRequest = Spider.request.defaults(defaultRequestConfig);

  return function(requestConfig, parseConfig, proxyConfig) {
    requestConfig = extend({}, defaultRequestConfig, requestConfig);
    requestConfig.request = myRequest;

    parseConfig = extend(undefined, defaultParseConfig, parseConfig);
    proxyConfig = extend(undefined, defaultProxyConfig, proxyConfig);
    
    return gather(requestConfig, parseConfig, proxyConfig);
  };
};