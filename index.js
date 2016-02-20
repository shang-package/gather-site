'use strict';

var Promise = require('bluebird');

var Spider = require('./lib/spider.js');
var proxyPool = require('./lib/proxyPool.js');
var retryStrategy = require('./lib/retryStrategy.js');


module.exports = function(requestConfig, parseConfig, proxyConfig) {
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
};

module.exports.proxyPool = proxyPool;
module.exports.retryStrategy = retryStrategy;