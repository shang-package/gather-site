'use strict';

var Proxy = require('./proxy.js');

var _proxyPool = {};

module.exports = {
  getProxy: function(proxyConfig, isPromise) {
    var proxyName = Proxy.getName(proxyConfig);

    _proxyPool[proxyName] = _proxyPool[proxyName] || new Proxy(proxyConfig);

    if(isPromise === false) {
      _proxyPool[proxyName].init();
      return _proxyPool[proxyName];
    }

    return _proxyPool[proxyName]
      .init()
      .then(function() {
        return _proxyPool[proxyName];
      });
  },
  clearAll: function() {
    for(var key in _proxyPool) {
      if(_proxyPool.hasOwnProperty(key)) {
        _proxyPool[key].clearUpdateInterval();
        delete _proxyPool[key];
      }
    }
  }
};
