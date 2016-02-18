'use strict';

var Promise = require('bluebird');
var chai = require('chai');

var siteInfos = require('./data.js').siteInfos;
var Spider = require('../lib/spider.js');

var should = chai.should();

describe('New Spider With Error siteInfo', function() {
  var spider;
  before(function(done) {
    spider = new Spider(siteInfos[1]);
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call checkRule', function() {
    it('should be false', function(done) {
      (spider.checkRule()).should.be.false;
      done();
    })
  });

  describe('When call checkRule witeh siteInfo', function() {
    it('should be false', function(done) {
      (new Spider(siteInfos[3]).checkRule()).should.be.false;
      done();
    });
  });

  describe('When call download', function() {
    it('should throw err', function(done) {
      spider
        .download()
        .then(function(data) {
          should.not.exist(data);
        })
        .catch(function(e) {
          should.exist(e);
        })
        .finally(function() {
          done();
        });
    });
  });

  describe('When call parse', function() {
    it('should have data', function(done) {
      spider.content = 'test test2 test3';
      Promise
        .resolve()
        .then(function() {
          return spider.parse()
        })
        .then(function(data) {
          should.exist(data);
          should.exist(data.test0);
        })
        .catch(function(e) {
          should.not.exist(e);
        })
        .finally(function() {
          done();
        });
    });
  });

  describe('When call parse with no extract_rules', function() {
    it('should have data', function(done) {
      spider = new Spider(siteInfos[2]);
      spider
        .download()
        .then(function() {
          spider.checkRule().should.be.true;
          return spider.parse();
        })
        .then(function(data) {
          should.exist(data);
          should.exist(data.length);
        })
        .catch(function(e) {
          should.not.exist(e);
        })
        .finally(done);
    });
  });
});