'use strict';

var should = require('should');

var proxyConfigs = require('./data.js').proxyConfigs;
var Proxy = require('../lib/proxy.js');


describe('proxy.js', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call init', function() {
    it('should have some init data', function() {
      var proxy = new Proxy(proxyConfigs[0]);
      return proxy
        .init()
        .then(function() {
          should.exist(proxy.__urlsIntervalTimer__);
          proxy.proxies.length.should.above(1);
          console.info('proxy.proxies ', proxy.proxies);
        });
    });
  });

  describe('When new Proxy with config false then call get ', function() {
    it('should have some data', function() {
      var proxy = new Proxy(false);
      proxy.proxies.length.should.equal(1);
      should.equal(proxy.get(), null);
    });
  });

  describe('When call get 1', function() {
    it('should have some data', function() {
      var proxy = new Proxy(proxyConfigs[0]);
      return proxy
        .init()
        .then(function() {
          should.notEqual(proxy.get(1), null);
        });
    });
  });

  describe('When call getName', function() {
    it('should have have name', function(done) {
      should.equal(Proxy.getName(), '__default__');
      should.equal(new Proxy().getName(), '__default__');
      should.equal(new Proxy(false).getName(), '__no_proxy__');
      should.equal(Proxy.getName(false), '__no_proxy__');
      should.equal(new Proxy({}).getName(), '__default__');
      should.notEqual(new Proxy(proxyConfigs[0]).getName(), '__default__');
      new Proxy(proxyConfigs[0]).getName().should.equal(new Proxy(proxyConfigs[0]).getName());
      done();
    });
  });

});