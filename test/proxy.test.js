'use strict';

var should = require('should');

var proxyConfigs = require('./data.js').proxyConfigs;
var Proxy = require('../lib/proxy.js');


describe('new Proxy', function() {
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
          should.exist(proxy.updateTimer);
          proxy.urls.length.should.equal(2);
          proxy.typeProxies.length.should.equal(2);
        });
    });
  });

  describe('When new Proxy with config false then call getOne ', function() {
    it('should have some data', function() {
      var proxy = new Proxy(false);
      should.equal(proxy.getOne(), null);
    });
  });

  describe('When call getOne type = 1', function() {
    it('should have some data', function() {
      var proxy = new Proxy(proxyConfigs[0]);
      return proxy
        .init()
        .then(function() {
          should.notEqual(proxy.getOne(1), null);
        });
    });
  });


  describe('When call setRetryRange', function() {
    it('should have some data', function(done) {
      var proxy = new Proxy(proxyConfigs[0]);
      proxy.setRetryRange([-1, 2.1]).should.eql([0, 0]);
      done();
    });
  });

  describe('When call setRetryRange', function() {
    it('should have some data', function(done) {
      var proxy = new Proxy();
      proxy.setRetryRange().should.eql([0, proxy.urls.length - 1]);
      done();
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
      done();
    });
  });

});