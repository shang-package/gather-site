'use strict';

var Promise = require('bluebird');
var should = require('should');

var proxyConfigs = require('./data.js').proxyConfigs;
var proxyPool = require('../lib/proxyPool.js');

describe('proxyPool get proxy', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call getProxy with same config', function() {
    it('should have a same proxy', function() {
      return Promise
        .all([
          proxyPool.getProxy(proxyConfigs[0]),
          proxyPool.getProxy(proxyConfigs[0])
        ])
        .then(function(proxies) {
          should.equal(proxies[0], proxies[1]);

          proxyPool.clearUpdateInterval();
          proxies[0].should.hasOwnProperty('__urlsIntervalTimer__', -1);
        });
    })
  });
});