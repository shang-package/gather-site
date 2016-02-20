'use strict';

var Promise = require('bluebird');
var Proxy = require('./proxy.js');

var _proxyPool = {};

module.exports = {
  getProxy: function(proxyConfig, noPromise) {
    var proxyName = Proxy.getName(proxyConfig);

    _proxyPool[proxyName] = _proxyPool[proxyName] || new Proxy(proxyConfig);

    if(noPromise) {
      return _proxyPool[proxyName];
    }

    return _proxyPool[proxyName]
      .init()
      .then(function() {
        return _proxyPool[proxyName];
      });
  },
  clearUpdateInterval: function() {
    for(var key in _proxyPool) {
      if(_proxyPool.hasOwnProperty(key)) {
        _proxyPool[key].clearUpdateInterval();
      }
    }
  }
};
