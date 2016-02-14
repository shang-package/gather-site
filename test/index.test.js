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
});