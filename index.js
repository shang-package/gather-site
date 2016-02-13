'use strict';

var Promise = require('bluebird');

var Spider = require('./lib/spider.js');
var Proxy = require('./lib/proxy.js');


module.exports = function(siteInfo, config) {
  if(!siteInfo) {
    throw new Error('缺少siteInfo');
  }
  var proxy = new Proxy();
  var spider;

  return Promise
    .resolve()
    .then(function() {
      if(siteInfo.proxy || config.proxy) {
        return proxy.init(siteInfo.proxy || config.proxy);
      }
      return null;
    })
    .then(function() {
      spider = new Spider(siteInfo, proxy);
      if(!spider.checkRule()) {
        throw new Error('invalid arguments');
      }
      return spider.download();
    })
    .then(function() {
      return spider.parse();
    });
};
