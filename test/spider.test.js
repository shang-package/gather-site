'use strict';

var Promise = require('bluebird');
var should = require('should');

var data = require('./data.js');
var Spider = require('../lib/spider.js');


describe('spider.js', function() {
  before(function(done) {
    done();
  });

  after(function(done) {
    done();
  });

  describe('When call checkRule With no requestConfig', function() {
    it('should be false', function(done) {
      (new Spider().checkRule()).should.be.false;
      done();
    })
  });

  describe('When call checkRule with requestConfig', function() {
    it('should be true', function(done) {
      (new Spider(data.requestConfigs[0]).checkRule()).should.be.true;
      done();
    });
  });

  describe('When call checkRule with err parseConfig', function() {
    it('should be false', function(done) {
      (new Spider(data.requestConfigs[0], data.parseConfigs[2]).checkRule()).should.be.false;
      done();
    });
  });

  describe('When call checkRule with parseConfig', function() {
    it('should be true', function(done) {
      (new Spider(data.requestConfigs[0], data.parseConfigs[1]).checkRule()).should.be.true;
      done();
    });
  });

  describe('When call With no requestConfig', function() {
    it('should err', function() {
      return (new Spider())
        .download()
        .should.be.rejected()
    });
  });

  describe('When call With requestConfig', function() {
    it('should have data', function() {
      (new Spider(data.requestConfigs[0]))
        .download()
        .then(function(data) {
          should.exist(data);
        });
    });
  });

  describe('When call parse', function() {
    it('should have data', function() {
      var spider = new Spider(null, data.parseConfigs[1]);
      spider.content = 'test test2 test3';
      return Promise
        .resolve()
        .then(function() {
          return spider.parse()
        })
        .then(function(data) {
          data.test0.should.eql(['test']);
        });
    });
  });

  describe('When call parse with no extract_rules', function() {
    it('should have data', function() {
      var spider = new Spider(data.requestConfigs[0], data.parseConfigs[3]);

      spider
        .download()
        .then(function() {
          return spider.parse();
        })
        .then(function(data) {
          should.exist(data);
          should.exist(data.length);
        });
    });
  });
});