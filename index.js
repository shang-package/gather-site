'use strict';

var Promise = require('bluebird');

var Spider = require('./lib/spider.js');
var proxyPool = require('./lib/proxyPool.js');

module.exports = function(siteInfo, config) {
  config = config || {};
  var spider;

  return Promise
    .resolve()
    .then(function() {
      if(!siteInfo) {
        return Promise.reject('缺少siteInfo');
      }
      var proxyConfig = siteInfo.proxy || config.proxy;
      return proxyPool.getProxy(proxyConfig)
    })
    .then(function(proxy) {
      spider = new Spider(siteInfo, proxy);
      if(!spider.checkRule()) {
        return Promise.reject('siteInfo 参数非法');
      }
      return spider.download();
    })
    .then(function() {
      return spider.parse();
    });
};

module.exports.proxyPool = proxyPool;