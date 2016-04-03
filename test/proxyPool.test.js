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

  describe('When call getProxy', function() {
    it('should have a proxy', function() {
      return proxyPool
        .getProxy()
        .then(function(proxy) {
          proxy.urls.length.should.equal(2);
          proxy.typeProxies.length.should.equal(2);
        });
    });
  });

  describe('When call getProxy with config=false', function() {
    it('should have a proxy with no proxy', function() {
      return proxyPool
        .getProxy(false)
        .then(function(proxy) {
          proxy.noProxy.should.equal(true);
          should.equal(proxy.getOne(), null);
        });
    });
  });

  describe('When call getProxy with same config', function() {
    it('should have a same proxy', function() {
      return Promise
        .all([
          proxyPool
            .getProxy(proxyConfigs[0]),
          proxyPool
            .getProxy(proxyConfigs[0])
        ])
        .then(function(proxys) {
          should.equal(proxys[0], proxys[1]);
        });
    })
  });
});