'use strict';

var Proxy = require('./proxy.js');

var _proxyPool = {};

module.exports = {
  getProxy: function(proxyConfig) {
    var proxyName = Proxy.getName(proxyConfig);

    _proxyPool[proxyName] = _proxyPool[proxyName] || new Proxy(proxyConfig);

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
