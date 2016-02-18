'use strict';

var chai = require('chai');
var Promise = require('bluebird');

var proxyInfos = require('./data.js').proxyInfos;
var proxyPool = require('../lib/proxyPool.js');

var should = chai.should();

describe('proxyPool get proxy', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call getProxy', function() {
    it('should have a proxy', function(done) {
      proxyPool
        .getProxy(proxyInfos[0])
        .then(function(proxy) {
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

  describe('When call getProxy with same config', function() {
    it('should have a same proxy', function(done) {
      Promise
        .all([
          proxyPool
            .getProxy(proxyInfos[0]),
          proxyPool
            .getProxy(proxyInfos[0])
        ])
        .then(function(proxys) {
          should.equal(proxys[0], proxys[1]);
        })
        .catch(function(e) {
          should.not.exist(e);
        })
        .finally(function() {
          done();
        });
    })
  });
});