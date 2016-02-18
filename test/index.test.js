'use strict';

var chai = require('chai');

var siteInfos = require('./data.js').siteInfos;
var gather = require('../index.js');

var should = chai.should();

describe('gater siteInfo', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call gather', function() {
    it('should have some data', function(done) {
      var siteInfo = siteInfos[0];

      gather(siteInfo, {proxy: true})
        .then(function(data) {
          should.exist(data);
          data.ipList.length.should.be.above(3);
        })
        .catch(function(e) {
          console.log(e && e.stack || e);
          should.not.exist(e);
        })
        .finally(done);
    })
  });


  describe('When call gather with no siteInfo', function() {
    it('should have some data', function(done) {

      gather()
        .catch(function(e) {
          should.exist(e);
        })
        .finally(done);
    })
  });

  describe('When call gather with error siteInfo', function() {
    it('should have some data', function(done) {

      gather(siteInfos[1])
        .catch(function(e) {
          should.exist(e);
        })
        .finally(done);
    })
  });

  describe('When call gather proxyPool', function() {
    it('should success execute', function(done) {
      gather
        .proxyPool
        .getProxy({})
        .then(function(proxy) {
          should.exist(proxy.updateTimer);
          proxy.updateTimer.should.have.property('_idleTimeout', 60000);
          gather.proxyPool.clearUpdateInterval();
          proxy.updateTimer.should.have.property('_idleTimeout', -1);

          proxy.setUpdateInterval();
          proxy.updateTimer.should.have.property('_idleTimeout', 60000);
          done()
        })
    })
  });
});