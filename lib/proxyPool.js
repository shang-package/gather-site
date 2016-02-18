'use strict';

var Promise = require('bluebird');
var Proxy = require('./proxy.js');

var _proxyPool = {};

module.exports = {
  getProxy: function(proxyConfig) {
    var proxyName = Proxy.getName(proxyConfig);

    return Promise
      .resolve()
      .then(function() {

        if(_proxyPool[proxyName]) {
          console.log('use existed proxyName: ', proxyName);
          return _proxyPool[proxyName];
        }

        _proxyPool[proxyName] = new Proxy();

        if(!proxyConfig) {
          return _proxyPool[proxyName];
        }
        return _proxyPool[proxyName].init(proxyConfig);
      })
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
