'use strict';

var should = require('should');

var data = require('./data.js');
var gather = require('../index.js');

describe('index.js', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call gather with correct config', function() {
    it('should have some data', function() {
      return gather(data.requestConfigs[1], data.parseConfigs[0])
        .then(function(data) {
          should.exist(data);
          data.ipList.length.should.be.above(0);
        });
    })
  });


  describe('When call gather with no requestConfigs', function() {
    it('should have some data', function() {
      return gather().should.be.rejectedWith(/参数非法/);
    })
  });

  describe('When call gather with json', function() {
    it('should have some data', function() {

      return gather(data.requestConfigs[0])
        .then(function(data) {
          data.length.should.above(0);
        });
    })
  });

  describe('When call gather proxyPool', function() {
    it('should success execute', function() {

      return gather
        .proxyPool
        .getProxy()
        .then(function(proxy) {
          should.exist(proxy.updateTimer);
          proxy.updateTimer.should.have.property('_idleTimeout', 60000);
          gather.proxyPool.clearUpdateInterval();
          proxy.updateTimer.should.have.property('_idleTimeout', -1);

          proxy.setUpdateInterval();
          proxy.updateTimer.should.have.property('_idleTimeout', 60000);
        });
    })
  });
});