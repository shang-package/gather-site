'use strict';

var chai = require('chai');

var proxyInfos = require('./data.js').proxyInfos;
var Proxy = require('../lib/proxy.js');

var should = chai.should();

describe('new Proxy', function() {
  var proxy;
  before(function(done) {
    proxy = new Proxy(proxyInfos[0]);
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call init', function() {
    it('should have some init data', function(done) {
      proxy
        .init()
        .then(function() {
          should.exist(proxy.urls);
          proxy.typeProxies.length.should.equal(3);
        })
        .catch(function(e) {
          should.not.exist(e);
        })
        .finally(function() {
          done();
        });
    })
  });

  describe('When call getOne', function() {
    it('should have some data', function(done) {
      should.equal(proxy.getOne(), null);
      done();
    });
  });

  describe('When call getOne type = 1', function() {
    it('should have some data', function(done) {
      should.not.equal(proxy.getOne(1), null);
      done();
    });
  });
});